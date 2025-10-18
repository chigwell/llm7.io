import * as ts from "typescript";

/**
 * Represents a single prop definition extracted from TypeScript AST
 */
export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  description?: string;
  tags?: string[];
  enumValues?: string[];
  isUnion?: boolean;
  unionTypes?: string[];
}

/**
 * Represents component props information extracted from AST
 */
export interface ComponentPropsInfo {
  componentName: string;
  propsInterfaceName?: string;
  props: PropDefinition[];
  description?: string;
  examples?: string[];
  extendsFrom?: string[];
}

/**
 * Configuration for AST parsing
 */
export interface ParseOptions {
  includePrivateProps?: boolean;
  extractExamples?: boolean;
  resolveUnions?: boolean;
  maxDepth?: number;
}

/**
 * TypeScript AST Parser for React Component Props
 */
export class TypeScriptASTParser {
  private sourceFile: ts.SourceFile;

  constructor(sourceCode: string, fileName: string = "component.tsx") {
    try {
      // Create a simpler TypeScript setup without full program
      this.sourceFile = ts.createSourceFile(
        fileName,
        sourceCode,
        ts.ScriptTarget.ES2020,
        true,
        ts.ScriptKind.TSX
      );

      // We'll use the source file directly without creating a full program
      // This avoids the TypeScript compiler host issues
    } catch (error) {
      console.error("Error creating TypeScript source file:", error);
      throw error;
    }
  }

  /**
   * Extract component props information from the source code
   */
  public extractComponentProps(
    componentName?: string,
    options: ParseOptions = {}
  ): ComponentPropsInfo | null {
    const {
      includePrivateProps = false,
      extractExamples = true,
      resolveUnions = true,
      maxDepth = 3,
    } = options;

    try {
      // Find the main component function or class
      const component = this.findComponent(componentName);
      if (!component) {
        console.warn(`Component ${componentName || "default"} not found`);
        return null;
      }

      const actualComponentName = this.getComponentName(component) || componentName || "Unknown";
      
      // Extract props interface/type
      const propsInfo = this.extractPropsFromComponent(component, {
        includePrivateProps,
        resolveUnions,
        maxDepth,
      });

      // Extract component description
      const description = this.extractJSDocDescription(component);

      // Extract usage examples if requested
      const examples = extractExamples ? this.extractUsageExamples() : [];

      return {
        componentName: actualComponentName,
        propsInterfaceName: propsInfo.interfaceName,
        props: propsInfo.props,
        description,
        examples,
        extendsFrom: propsInfo.extendsFrom,
      };
    } catch (error) {
      console.error("Error extracting component props:", error);
      return null;
    }
  }

  /**
   * Find all components in the source file
   */
  public findAllComponents(): Array<{ node: ts.Node; name: string; hasProps: boolean }> {
    const components: Array<{ node: ts.Node; name: string; hasProps: boolean }> = [];

    const visit = (node: ts.Node): void => {
      let componentName: string | undefined;
      let componentNode: ts.Node | undefined;

      // Look for function declarations
      if (ts.isFunctionDeclaration(node)) {
        componentName = node.name?.text;
        componentNode = node;
      }

      // Look for arrow function variable declarations
      if (ts.isVariableDeclaration(node) && node.initializer) {
        const name = ts.isIdentifier(node.name) ? node.name.text : undefined;
        if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
          componentName = name;
          componentNode = node;
        }
      }

      // Look for class declarations
      if (ts.isClassDeclaration(node)) {
        componentName = node.name?.text;
        componentNode = node;
      }

      if (componentName && componentNode) {
        // Check if this component has props
        const propsType = this.findPropsType(componentNode);
        const hasProps = !!propsType && (
          ts.isTypeReferenceNode(propsType) || 
          (ts.isTypeLiteralNode(propsType) && propsType.members.length > 0)
        );

        components.push({
          node: componentNode,
          name: componentName,
          hasProps
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return components;
  }

  /**
   * Find the best component function or class in the source file
   */
  private findComponent(componentName?: string): ts.Node | null {
    const allComponents = this.findAllComponents();

    if (allComponents.length === 0) {
      return null;
    }

    // If a specific component name is provided, try to find it first
    if (componentName) {
      const exactMatch = allComponents.find(comp => comp.name === componentName);
      if (exactMatch) {
        return exactMatch.node;
      }

      // Try partial matching for component names
      const partialMatch = allComponents.find(comp => 
        comp.name.toLowerCase().includes(componentName.toLowerCase().replace(/\s/g, '')) ||
        componentName.toLowerCase().replace(/\s/g, '').includes(comp.name.toLowerCase())
      );
      if (partialMatch) {
        return partialMatch.node;
      }
    }

    // Prioritize components with props interfaces
    const componentsWithProps = allComponents.filter(comp => comp.hasProps);
    if (componentsWithProps.length > 0) {
      // Return the first component with props that's not a showcase/theme variant
      const mainComponent = componentsWithProps.find(comp => 
        !comp.name.toLowerCase().includes('showcase') &&
        !comp.name.toLowerCase().includes('theme') &&
        !comp.name.toLowerCase().includes('example')
      );
      
      if (mainComponent) {
        return mainComponent.node;
      }
      
      // Fallback to any component with props
      return componentsWithProps[0].node;
    }

    // Fallback to the first component found
    return allComponents[0].node;
  }

  /**
   * Get component name from node
   */
  private getComponentName(node: ts.Node): string | undefined {
    if (ts.isFunctionDeclaration(node)) {
      return node.name?.text;
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      return node.name.text;
    }
    if (ts.isClassDeclaration(node)) {
      return node.name?.text;
    }
    return undefined;
  }

  /**
   * Extract props information from component
   */
  private extractPropsFromComponent(
    component: ts.Node,
    options: { includePrivateProps: boolean; resolveUnions: boolean; maxDepth: number }
  ): { props: PropDefinition[]; interfaceName?: string; extendsFrom?: string[] } {
    // Find props parameter type
    const propsType = this.findPropsType(component);
    if (!propsType) {
      return { props: [] };
    }

    // Extract default values from component parameters
    const defaultValues = this.extractDefaultValuesFromNode(component);

    // If it's a type reference, resolve it
    if (ts.isTypeReferenceNode(propsType)) {
      const typeName = ts.isIdentifier(propsType.typeName) ? propsType.typeName.text : undefined;
      if (typeName) {
        const interfaceDecl = this.findInterface(typeName);
        if (interfaceDecl) {
          const props = this.extractPropsFromInterface(interfaceDecl, options);
          // Merge default values with props
          const propsWithDefaults = props.map(prop => ({
            ...prop,
            defaultValue: defaultValues[prop.name] ?? prop.defaultValue
          }));
          
          return {
            props: propsWithDefaults,
            interfaceName: typeName,
            extendsFrom: this.getExtendsClause(interfaceDecl),
          };
        }
      }
    }

    // If it's an inline type literal
    if (ts.isTypeLiteralNode(propsType)) {
      const props = this.extractPropsFromTypeLiteral(propsType, options);
      // Merge default values with props
      const propsWithDefaults = props.map(prop => ({
        ...prop,
        defaultValue: defaultValues[prop.name] ?? prop.defaultValue
      }));
      
      return {
        props: propsWithDefaults,
      };
    }

    return { props: [] };
  }

  /**
   * Find props type from component parameters
   */
  private findPropsType(component: ts.Node): ts.TypeNode | undefined {
    if (ts.isFunctionDeclaration(component) || ts.isArrowFunction(component) || ts.isFunctionExpression(component)) {
      const func = component as ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;
      const firstParam = func.parameters[0];
      if (firstParam && firstParam.type) {
        return firstParam.type;
      }
    }

    if (ts.isVariableDeclaration(component) && component.initializer) {
      if (ts.isArrowFunction(component.initializer) || ts.isFunctionExpression(component.initializer)) {
        return this.findPropsType(component.initializer);
      }
    }

    return undefined;
  }

  /**
   * Find interface declaration by name
   */
  private findInterface(name: string): ts.InterfaceDeclaration | undefined {
    let foundInterface: ts.InterfaceDeclaration | undefined;

    const visit = (node: ts.Node): void => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
        foundInterface = node;
        return;
      }
      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return foundInterface;
  }

  /**
   * Extract props from interface declaration
   */
  private extractPropsFromInterface(
    interfaceDecl: ts.InterfaceDeclaration,
    options: { includePrivateProps: boolean; resolveUnions: boolean; maxDepth: number }
  ): PropDefinition[] {
    const props: PropDefinition[] = [];

    for (const member of interfaceDecl.members) {
      if (ts.isPropertySignature(member)) {
        const prop = this.extractPropFromPropertySignature(member, options);
        if (prop && (options.includePrivateProps || !prop.name.startsWith('_'))) {
          props.push(prop);
        }
      }
    }

    return props;
  }

  /**
   * Extract props from type literal
   */
  private extractPropsFromTypeLiteral(
    typeLiteral: ts.TypeLiteralNode,
    options: { includePrivateProps: boolean; resolveUnions: boolean; maxDepth: number }
  ): PropDefinition[] {
    const props: PropDefinition[] = [];

    for (const member of typeLiteral.members) {
      if (ts.isPropertySignature(member)) {
        const prop = this.extractPropFromPropertySignature(member, options);
        if (prop && (options.includePrivateProps || !prop.name.startsWith('_'))) {
          props.push(prop);
        }
      }
    }

    return props;
  }

  /**
   * Extract prop definition from property signature
   */
  private extractPropFromPropertySignature(
    prop: ts.PropertySignature,
    options: { resolveUnions: boolean; maxDepth: number }
  ): PropDefinition | null {
    const name = this.getPropertyName(prop);
    if (!name) return null;

    const required = !prop.questionToken;
    const type = this.getTypeString(prop.type);
    const description = this.extractJSDocDescription(prop);
    const tags = this.extractJSDocTags(prop);
    
    // Extract union types and enum values
    const { isUnion, unionTypes, enumValues } = this.analyzeType(prop.type, options);

    return {
      name,
      type,
      required,
      description,
      tags,
      isUnion,
      unionTypes,
      enumValues,
    };
  }

  /**
   * Get property name from property signature
   */
  private getPropertyName(prop: ts.PropertySignature): string | undefined {
    if (ts.isIdentifier(prop.name)) {
      return prop.name.text;
    }
    if (ts.isStringLiteral(prop.name)) {
      return prop.name.text;
    }
    return undefined;
  }

  /**
   * Get type string representation
   */
  private getTypeString(typeNode: ts.TypeNode | undefined): string {
    if (!typeNode) return "unknown";

    switch (typeNode.kind) {
      case ts.SyntaxKind.StringKeyword:
        return "string";
      case ts.SyntaxKind.NumberKeyword:
        return "number";
      case ts.SyntaxKind.BooleanKeyword:
        return "boolean";
      case ts.SyntaxKind.AnyKeyword:
        return "any";
      case ts.SyntaxKind.VoidKeyword:
        return "void";
      case ts.SyntaxKind.NullKeyword:
        return "null";
      case ts.SyntaxKind.UndefinedKeyword:
        return "undefined";
      case ts.SyntaxKind.ObjectKeyword:
        return "object";
      default:
        return typeNode.getText(this.sourceFile);
    }
  }

  /**
   * Analyze type for unions and enums
   */
  private analyzeType(
    typeNode: ts.TypeNode | undefined,
    options: { resolveUnions: boolean; maxDepth: number }
  ): { isUnion: boolean; unionTypes?: string[]; enumValues?: string[] } {
    if (!typeNode || !options.resolveUnions) {
      return { isUnion: false };
    }

    if (ts.isUnionTypeNode(typeNode)) {
      const unionTypes = typeNode.types.map(t => this.getTypeString(t));
      const enumValues = typeNode.types
        .filter(ts.isLiteralTypeNode)
        .map(t => t.literal.getText(this.sourceFile))
        .filter(Boolean);

      return {
        isUnion: true,
        unionTypes,
        enumValues: enumValues.length > 0 ? enumValues : undefined,
      };
    }

    return { isUnion: false };
  }

  /**
   * Extract JSDoc description from node
   */
  private extractJSDocDescription(node: ts.Node): string | undefined {
    const jsDocNodes = ts.getJSDocCommentsAndTags(node);
    
    for (const jsDoc of jsDocNodes) {
      if (ts.isJSDoc(jsDoc) && jsDoc.comment) {
        if (typeof jsDoc.comment === "string") {
          return jsDoc.comment.trim();
        }
        if (Array.isArray(jsDoc.comment)) {
          return jsDoc.comment.map(c => c.text).join(" ").trim();
        }
      }
    }

    return undefined;
  }

  /**
   * Extract JSDoc tags from node
   */
  private extractJSDocTags(node: ts.Node): string[] {
    const tags: string[] = [];
    const jsDocNodes = ts.getJSDocCommentsAndTags(node);

    for (const jsDoc of jsDocNodes) {
      if (ts.isJSDoc(jsDoc) && jsDoc.tags) {
        for (const tag of jsDoc.tags) {
          if (tag.tagName) {
            tags.push(tag.tagName.text);
          }
        }
      }
    }

    return tags;
  }

  /**
   * Get extends clause from interface
   */
  private getExtendsClause(interfaceDecl: ts.InterfaceDeclaration): string[] {
    if (!interfaceDecl.heritageClauses) return [];

    const extendsFrom: string[] = [];
    
    for (const heritage of interfaceDecl.heritageClauses) {
      if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
        for (const type of heritage.types) {
          extendsFrom.push(type.expression.getText(this.sourceFile));
        }
      }
    }

    return extendsFrom;
  }

  /**
   * Extract usage examples from JSDoc
   */
  private extractUsageExamples(): string[] {
    const examples: string[] = [];
    
    const visit = (node: ts.Node): void => {
      const jsDocNodes = ts.getJSDocCommentsAndTags(node);
      
      for (const jsDoc of jsDocNodes) {
        if (ts.isJSDoc(jsDoc) && jsDoc.tags) {
          for (const tag of jsDoc.tags) {
            if (tag.tagName?.text === "example" && tag.comment) {
              if (typeof tag.comment === "string") {
                examples.push(tag.comment.trim());
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(this.sourceFile);
    return examples;
  }

  /**
   * Extract default values from a component node's parameters
   */
  public extractDefaultValuesFromNode(node: ts.Node): Record<string, unknown> {
    const defaultValues: Record<string, unknown> = {};

    // Extract from function parameters
    const extractFromFunction = (func: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression) => {
      const firstParam = func.parameters[0];
      if (!firstParam) return;

      // Handle destructured parameters with defaults
      if (ts.isObjectBindingPattern(firstParam.name)) {
        for (const element of firstParam.name.elements) {
          if (ts.isBindingElement(element) && element.initializer) {
            const name = ts.isIdentifier(element.name) ? element.name.text : undefined;
            if (name) {
              defaultValues[name] = this.evaluateExpression(element.initializer);
            }
          }
        }
      }

      // Handle default parameter values
      if (firstParam.initializer) {
        if (ts.isObjectLiteralExpression(firstParam.initializer)) {
          for (const property of firstParam.initializer.properties) {
            if (ts.isPropertyAssignment(property)) {
              const name = ts.isIdentifier(property.name) ? property.name.text : undefined;
              if (name) {
                defaultValues[name] = this.evaluateExpression(property.initializer);
              }
            }
          }
        }
      }
    };

    if (ts.isFunctionDeclaration(node)) {
      extractFromFunction(node);
    } else if (ts.isVariableDeclaration(node) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        extractFromFunction(node.initializer);
      }
    }

    return defaultValues;
  }

  /**
   * Evaluate a TypeScript expression to extract its value
   */
  private evaluateExpression(expr: ts.Expression): unknown {
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      return expr.text;
    }
    if (ts.isNumericLiteral(expr)) {
      return Number(expr.text);
    }
    if (expr.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }
    if (expr.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    if (expr.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }
    if (expr.kind === ts.SyntaxKind.UndefinedKeyword) {
      return undefined;
    }
    if (ts.isArrayLiteralExpression(expr)) {
      return expr.elements.map(e => this.evaluateExpression(e));
    }
    if (ts.isObjectLiteralExpression(expr)) {
      const obj: Record<string, unknown> = {};
      for (const property of expr.properties) {
        if (ts.isPropertyAssignment(property)) {
          const name = ts.isIdentifier(property.name) ? property.name.text : undefined;
          if (name) {
            obj[name] = this.evaluateExpression(property.initializer);
          }
        }
      }
      return obj;
    }
    
    // Fallback: return the text representation
    return expr.getText(this.sourceFile);
  }
}

/**
 * Extract component props information from TypeScript source code
 */
export function extractComponentPropsFromSource(
  sourceCode: string,
  componentName?: string,
  options: ParseOptions = {}
): ComponentPropsInfo | null {
  try {
    const parser = new TypeScriptASTParser(sourceCode);
    return parser.extractComponentProps(componentName, options);
  } catch (error) {
    console.error("Failed to extract component props:", error);
    return null;
  }
}

/**
 * Extract default values from component function parameters using TypeScript AST
 */
export function extractDefaultValuesFromSource(sourceCode: string): Record<string, unknown> {
  try {
    const parser = new TypeScriptASTParser(sourceCode);
    const defaultValues: Record<string, unknown> = {};

    // Find all components and extract default values from their parameters
    const allComponents = parser.findAllComponents();
    
    for (const { node } of allComponents) {
      const extractedDefaults = parser.extractDefaultValuesFromNode(node);
      Object.assign(defaultValues, extractedDefaults);
    }

    return defaultValues;
  } catch (error) {
    console.error("Failed to extract default values:", error);
    return {};
  }
}