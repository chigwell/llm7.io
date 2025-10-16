"use client";

import { Button } from "@/components/ui/buttonShadcn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Project = {
  id: number;
  name: string;
  description: string;
  image: string;
  url: string;
  category: string;
  technologies: string[];
};

const showcaseProjects: Project[] = [];

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24">
    <span
      className="text-6xl mb-4 animate-bounce"
      role="img"
      aria-label="Rocket"
    >
      🚀
    </span>
    <h3 className="text-2xl font-semibold mb-2">
      Cooking something Beautiful...
    </h3>
    <p className="text-muted-foreground text-lg mb-4">
      Stay tuned! We are preparing some amazing showcases for you.
    </p>
  </div>
);

export default function Showcase() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient-x">
          Projects in Production
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover how businesses are leveraging our solutions to drive growth
          and innovation. See real implementations making a difference across
          various industries.
        </p>
      </div>

      {/* Showcase Grid */}
      {showcaseProjects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {showcaseProjects.map((project) => (
            <Card
              key={project.id}
              className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-primary/40 bg-white/90 dark:bg-black/60 backdrop-blur-md"
              tabIndex={0}
              aria-label={`Showcase project: ${project.name}`}
            >
              <CardHeader className="p-0 relative">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={project.image}
                    alt={project.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-black shadow"
                    >
                      {project.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors font-bold">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-sm mb-4 line-clamp-2">
                  {project.description}
                </CardDescription>
                {/* Technologies */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.map((tech: string) => (
                    <Badge
                      key={tech}
                      variant="outline"
                      className="text-xs border-primary/30"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
                {/* Visit Link */}
                <Link
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label={`Visit ${project.name} website`}
                >
                  Visit Website
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/10 rounded-2xl p-8 md:p-14 text-center shadow-lg mt-8 border border-primary/10">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-4 flex items-center justify-center gap-2">
            <span className="inline-block animate-wiggle">✨</span>
            Want Your Project Featured Here?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join our showcase and let the world see how you&apos;re using our
            solutions to transform your business. Get in touch to discuss
            featuring your implementation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="inline-flex items-center animate-glow"
            >
              <a
                href="mailto:john.rambo.9901@gmail.com"
                aria-label="Email to get featured"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Me
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
