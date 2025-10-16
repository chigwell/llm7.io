import fs from "fs/promises";
import path from "path";

// Function to read component source code
async function readComponentSource(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Function to extract default props from TypeScript AST (simplified)
function extractDefaultProps(sourceCode, componentName) {
  try {
    const props = {};

    // Look for default values in destructuring
    const destructureMatches = sourceCode.match(
      /\{\s*([^}]+)\s*\}\s*=\s*props/g
    );
    if (destructureMatches) {
      destructureMatches.forEach((match) => {
        const propsContent = match.match(/\{([^}]+)\}/)?.[1];
        if (propsContent) {
          const propPairs = propsContent.split(",");
          propPairs.forEach((pair) => {
            const defaultMatch = pair.match(/(\w+)\s*=\s*([^,]+)/);
            if (defaultMatch) {
              const [, propName, defaultValue] = defaultMatch;
              try {
                // Try to parse the default value
                if (defaultValue.includes('"') || defaultValue.includes("'")) {
                  props[propName.trim()] = defaultValue.replace(/['"]/g, "");
                } else if (
                  defaultValue === "true" ||
                  defaultValue === "false"
                ) {
                  props[propName.trim()] = defaultValue === "true";
                } else if (!isNaN(Number(defaultValue))) {
                  props[propName.trim()] = Number(defaultValue);
                } else {
                  props[propName.trim()] = defaultValue.trim();
                }
              } catch {
                props[propName.trim()] = defaultValue.trim();
              }
            }
          });
        }
      });
    }

    return props;
  } catch (error) {
    console.error(
      `Error extracting props for ${componentName}:`,
      error.message
    );
    return {};
  }
}

// Function to parse component entries from the mapping structure
function parseComponentEntries(mapContent) {
  const entries = [];

  // More robust approach: find the balance of brackets for each category
  // Handle both quoted and unquoted property names
  const categoryStartPattern = /(?:"([^"]+)"|([a-zA-Z\s]+)):\s*\[/g;
  let match;

  while ((match = categoryStartPattern.exec(mapContent)) !== null) {
    // Handle both quoted and unquoted category names
    const categoryName = match[1] || match[2];
    const startIndex = match.index + match[0].length;

    // Skip "Get Started" as it contains documentation, not UI components
    if (categoryName === "Get Started") {
      continue;
    }

    // Find the matching closing bracket
    let bracketCount = 1;
    let currentIndex = startIndex;
    let categoryContent = "";

    while (bracketCount > 0 && currentIndex < mapContent.length) {
      const char = mapContent[currentIndex];
      if (char === "[") bracketCount++;
      else if (char === "]") bracketCount--;

      if (bracketCount > 0) {
        categoryContent += char;
      }
      currentIndex++;
    }

    // Now parse individual component entries within this category
    const entryPattern = /\{\s*([\s\S]*?)\s*\}/g;
    let entryMatch;

    while ((entryMatch = entryPattern.exec(categoryContent)) !== null) {
      const entryContent = entryMatch[1];

      // Extract name and path from this specific entry
      const nameMatch = entryContent.match(/name:\s*["']([^"']+)["']/);
      const pathMatch = entryContent.match(/path:\s*["']([^"']+)["']/);

      if (nameMatch) {
        const componentName = nameMatch[1];
        const componentPath = pathMatch ? pathMatch[1] : null;

        entries.push({
          name: componentName,
          path: componentPath,
          category: categoryName,
        });
      }
    }
  }

  return entries;
}

async function generateSourceMap() {
  try {
    // Read the ComponentMapping file to get all components
    const mappingPath = path.join(process.cwd(), "data/ComponentMapping.ts");
    const mappingContent = await fs.readFile(mappingPath, "utf-8");

    const sourceMap = {};
    const propMap = {};

    // Parse the componentMap to find all components with paths
    const componentMapMatch = mappingContent.match(
      /export const componentMap[^=]*=\s*(\{[\s\S]*?\});/
    );
    if (componentMapMatch) {
      const mapContent = componentMapMatch[1];

      // Parse component entries maintaining name-path relationships
      const entries = parseComponentEntries(mapContent);

      console.log(`Found ${entries.length} component entries`);

      // Process each component entry
      for (const entry of entries) {
        if (entry.path && entry.path.endsWith(".tsx")) {
          const sourceCode = await readComponentSource(entry.path);

          if (sourceCode) {
            sourceMap[entry.name] = sourceCode;

            // Extract default props
            const className = entry.name.replace(/\s+/g, "");
            const defaultProps = extractDefaultProps(sourceCode, className);
            propMap[entry.name] = defaultProps;
          }
        }
      }
    }

    // Generate the output file
    const outputContent = `// Auto-generated source map for production builds
// Generated on: ${new Date().toISOString()}

export const componentSourceMap: Record<string, string> = ${JSON.stringify(
      sourceMap,
      null,
      2
    )};

export const componentPropsMap: Record<string, Record<string, unknown>> = ${JSON.stringify(
      propMap,
      null,
      2
    )};
`;

    await fs.writeFile(
      path.join(process.cwd(), "lib/componentSourceCode.ts"),
      outputContent
    );
    console.log(
      `✅ Generated source map with ${Object.keys(sourceMap).length} components`
    );
    console.log(`📝 Component names: ${Object.keys(sourceMap).join(", ")}`);

    // Verify the mapping
    console.log("\n🔍 Verification:");
    for (const [name, code] of Object.entries(sourceMap)) {
      const firstLine = code.split("\n")[0];
      console.log(`  ${name}: ${firstLine.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error("❌ Error generating source map:", error);
    process.exit(1);
  }
}

// Run the script
generateSourceMap();
