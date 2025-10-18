"use client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TunnelShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Set up shader material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1),
        },
      },
      vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float iTime;
                uniform vec3 iResolution;

                //Constants
                #define TAU 6.2831853071795865

                //Parameters
                #define TUNNEL_LAYERS 96
                #define RING_POINTS 128
                #define POINT_SIZE 1.8
                #define POINT_COLOR_A vec3(1.0)
                #define POINT_COLOR_B vec3(0.7)
                #define SPEED 0.7

                //Square of x
                float sq(float x) {
                    return x*x;   
                }

                //Angular repeat
                vec2 AngRep(vec2 uv, float angle) {
                    vec2 polar = vec2(atan(uv.y, uv.x), length(uv));
                    polar.x = mod(polar.x + angle / 2.0, angle) - angle / 2.0; 
                    return polar.y * vec2(cos(polar.x), sin(polar.x));
                }

                //Signed distance to circle
                float sdCircle(vec2 uv, float r) {
                    return length(uv) - r;
                }

                //Mix a shape defined by a distance field 'sd' with a 'target' color using the 'fill' color.
                vec3 MixShape(float sd, vec3 fill, vec3 target) {
                    float blend = smoothstep(0.0, 1.0/iResolution.y, sd);
                    return mix(fill, target, blend);
                }

                //Tunnel/Camera path
                vec2 TunnelPath(float x) {
                    vec2 offs = vec2(0, 0);
                    
                    offs.x = 0.2 * sin(TAU * x * 0.5) + 0.4 * sin(TAU * x * 0.2 + 0.3);
                    offs.y = 0.3 * cos(TAU * x * 0.3) + 0.2 * cos(TAU * x * 0.1);
                    
                    offs *= smoothstep(1.0, 4.0, x);
                    
                    return offs;
                }

                void main() {
                    vec2 res = iResolution.xy / iResolution.y;
                    vec2 uv = gl_FragCoord.xy / iResolution.y;
                    
                    uv -= res/2.0;
                    
                    vec3 color = vec3(0);
                    
                    float repAngle = TAU / float(RING_POINTS);
                    float pointSize = POINT_SIZE/2.0/iResolution.y;
                    
                    float camZ = iTime * SPEED;
                    vec2 camOffs = TunnelPath(camZ);
                    
                    for(int i = 1; i <= TUNNEL_LAYERS; i++) {
                        float pz = 1.0 - (float(i) / float(TUNNEL_LAYERS));
                        
                        //Scroll the points towards the screen
                        pz -= mod(camZ, 4.0 / float(TUNNEL_LAYERS));
                        
                        //Layer x/y offset
                        vec2 offs = TunnelPath(camZ + pz) - camOffs;
                        
                        //Radius of the current ring
                        float ringRad = 0.15 * (1.0 / sq(pz * 0.8 + 0.4));
                        
                        //Only draw points when uv is close to the ring.
                        if(abs(length(uv + offs) - ringRad) < pointSize * 1.5) {
                            //Angular repeated uv coords
                            vec2 aruv = AngRep(uv + offs, repAngle);

                            //Distance to the nearest point
                            float pdist = sdCircle(aruv - vec2(ringRad, 0), pointSize);

                            //Stripes
                            vec3 ptColor = (mod(float(i / 2), 2.0) == 0.0) ? POINT_COLOR_A : POINT_COLOR_B;
                            
                            //Distance fade
                            float shade = (1.0-pz);

                            color = MixShape(pdist, ptColor * shade, color);
                        }
                    }
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
    });

    // Create a plane to render the shader on
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Animation variables
    let lastTime = 0;
    const speedMultiplier = 0.5; // Set speed to 0.5x
    let animationId: number;

    // Animation loop
    function animate(time: number) {
      animationId = requestAnimationFrame(animate);

      time *= 0.001; // Convert to seconds
      const deltaTime = time - lastTime;
      lastTime = time;

      shaderMaterial.uniforms.iTime.value += deltaTime * speedMultiplier;

      renderer.render(scene, camera);
    }

    // Handle window resize
    function handleResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight,
        1
      );
    }
    window.addEventListener("resize", handleResize);

    // Start animation
    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
      scene.remove(mesh);
    };
  }, []);

  return (
    <>
      <div className="bg-black text-white min-h-screen overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-full h-full"
          id="tunnel-canvas"
        />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className={`${isMobile ? "mb-4 space-y-2" : "mb-8 space-y-3 md:space-y-6"}`}>
            <div className="inline-block">
              <h1 className={`${isMobile ? "text-3xl" : "text-6xl md:text-8xl"} font-black tracking-tighter bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-pulse`}>
                TUNNEL
              </h1>
              <div className={`h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent ${isMobile ? "mt-2" : "mt-4"} animate-pulse`} />
            </div>
            
            <p className={`${isMobile ? "text-sm px-4 leading-relaxed" : "text-lg md:text-xl px-0 leading-relaxed"} text-gray-300 max-w-2xl font-light`}>
              Experience an infinite journey through space and time with this mesmerizing 
              <span className="text-white font-medium"> Three.js </span> 
              powered tunnel effect that responds to your {isMobile ? "touch" : "movement"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function TunnelTheme() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    
    // Get container dimensions instead of window dimensions
    const container = canvas.parentElement;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Set up shader material with the same shader as TunnelShowcase
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector3(width, height, 1),
        },
      },
      vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float iTime;
                uniform vec3 iResolution;

                //Constants
                #define TAU 6.2831853071795865

                //Parameters
                #define TUNNEL_LAYERS 96
                #define RING_POINTS 128
                #define POINT_SIZE 1.8
                #define POINT_COLOR_A vec3(1.0)
                #define POINT_COLOR_B vec3(0.7)
                #define SPEED 0.7

                //Square of x
                float sq(float x) {
                    return x*x;   
                }

                //Angular repeat
                vec2 AngRep(vec2 uv, float angle) {
                    vec2 polar = vec2(atan(uv.y, uv.x), length(uv));
                    polar.x = mod(polar.x + angle / 2.0, angle) - angle / 2.0; 
                    return polar.y * vec2(cos(polar.x), sin(polar.x));
                }

                //Signed distance to circle
                float sdCircle(vec2 uv, float r) {
                    return length(uv) - r;
                }

                //Mix a shape defined by a distance field 'sd' with a 'target' color using the 'fill' color.
                vec3 MixShape(float sd, vec3 fill, vec3 target) {
                    float blend = smoothstep(0.0, 1.0/iResolution.y, sd);
                    return mix(fill, target, blend);
                }

                //Tunnel/Camera path
                vec2 TunnelPath(float x) {
                    vec2 offs = vec2(0, 0);
                    
                    offs.x = 0.2 * sin(TAU * x * 0.5) + 0.4 * sin(TAU * x * 0.2 + 0.3);
                    offs.y = 0.3 * cos(TAU * x * 0.3) + 0.2 * cos(TAU * x * 0.1);
                    
                    offs *= smoothstep(1.0, 4.0, x);
                    
                    return offs;
                }

                void main() {
                    vec2 res = iResolution.xy / iResolution.y;
                    vec2 uv = gl_FragCoord.xy / iResolution.y;
                    
                    uv -= res/2.0;
                    
                    vec3 color = vec3(0);
                    
                    float repAngle = TAU / float(RING_POINTS);
                    float pointSize = POINT_SIZE/2.0/iResolution.y;
                    
                    float camZ = iTime * SPEED;
                    vec2 camOffs = TunnelPath(camZ);
                    
                    for(int i = 1; i <= TUNNEL_LAYERS; i++) {
                        float pz = 1.0 - (float(i) / float(TUNNEL_LAYERS));
                        
                        //Scroll the points towards the screen
                        pz -= mod(camZ, 4.0 / float(TUNNEL_LAYERS));
                        
                        //Layer x/y offset
                        vec2 offs = TunnelPath(camZ + pz) - camOffs;
                        
                        //Radius of the current ring
                        float ringRad = 0.15 * (1.0 / sq(pz * 0.8 + 0.4));
                        
                        //Only draw points when uv is close to the ring.
                        if(abs(length(uv + offs) - ringRad) < pointSize * 1.5) {
                            //Angular repeated uv coords
                            vec2 aruv = AngRep(uv + offs, repAngle);

                            //Distance to the nearest point
                            float pdist = sdCircle(aruv - vec2(ringRad, 0), pointSize);

                            //Stripes
                            vec3 ptColor = (mod(float(i / 2), 2.0) == 0.0) ? POINT_COLOR_A : POINT_COLOR_B;
                            
                            //Distance fade
                            float shade = (1.0-pz);

                            color = MixShape(pdist, ptColor * shade, color);
                        }
                    }
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
    });

    // Create a plane to render the shader on
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    // Animation variables
    let lastTime = 0;
    const speedMultiplier = 0.5;
    let animationId: number;

    // Animation loop
    function animate(time: number) {
      animationId = requestAnimationFrame(animate);
      time *= 0.001;
      const deltaTime = time - lastTime;
      lastTime = time;
      shaderMaterial.uniforms.iTime.value += deltaTime * speedMultiplier;
      renderer.render(scene, camera);
    }

    // Handle container resize
    function handleResize() {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      shaderMaterial.uniforms.iResolution.value.set(newWidth, newHeight, 1);
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Start animation
    animate(0);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      shaderMaterial.dispose();
      scene.remove(mesh);
    };
  }, []);

  return (
    <div className="relative w-full h-96 bg-black overflow-hidden rounded-lg">
      {/* Canvas container */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white">
          <h2
            className={`${
              isMobile ? "text-2xl" : "text-4xl"
            } font-bold mb-2 md:mb-4`}
          >
            TUNNEL
          </h2>
          <p className={`${isMobile ? "text-sm" : "text-lg"} opacity-80`}>
            {isMobile
              ? "Touch to interact"
              : "Experience the infinite journey"}
          </p>
        </div>
      </div>
    </div>
  );
}