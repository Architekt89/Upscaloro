"use strict";(()=>{var e={};e.id=287,e.ids=[287],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11997:e=>{e.exports=require("punycode")},19121:e=>{e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},27910:e=>{e.exports=require("stream")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{e.exports=require("path")},34631:e=>{e.exports=require("tls")},43712:(e,s,r)=>{function a({children:e}){return e}r.r(s),r.d(s,{default:()=>a})},55511:e=>{e.exports=require("crypto")},55591:e=>{e.exports=require("https")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:e=>{e.exports=require("zlib")},76571:(e,s,r)=>{r.r(s),r.d(s,{GlobalError:()=>o.a,__next_app__:()=>m,pages:()=>c,routeModule:()=>p,tree:()=>l});var a=r(70260),t=r(28203),i=r(25155),o=r.n(i),n=r(67292),d={};for(let e in n)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);r.d(s,d);let l={children:["",{children:["api-docs",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,82967)),"/Users/businesslaptop/Documents/Upscaloro/frontend/app/api-docs/page.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,43712)),"/Users/businesslaptop/Documents/Upscaloro/frontend/app/api-docs/layout.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,19611)),"/Users/businesslaptop/Documents/Upscaloro/frontend/app/layout.tsx"],error:[()=>Promise.resolve().then(r.bind(r,72627)),"/Users/businesslaptop/Documents/Upscaloro/frontend/app/error.tsx"],loading:[()=>Promise.resolve().then(r.bind(r,84717)),"/Users/businesslaptop/Documents/Upscaloro/frontend/app/loading.tsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,61129)),"/Users/businesslaptop/Documents/Upscaloro/frontend/app/not-found.tsx"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,69116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,41485,23)),"next/dist/client/components/unauthorized-error"]}]}.children,c=["/Users/businesslaptop/Documents/Upscaloro/frontend/app/api-docs/page.tsx"],m={require:r,loadChunk:()=>Promise.resolve()},p=new a.AppPageRouteModule({definition:{kind:t.RouteKind.APP_PAGE,page:"/api-docs/page",pathname:"/api-docs",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},79428:e=>{e.exports=require("buffer")},79551:e=>{e.exports=require("url")},81630:e=>{e.exports=require("http")},82967:(e,s,r)=>{r.r(s),r.d(s,{default:()=>t});var a=r(62740);function t(){return(0,a.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,a.jsx)("div",{className:"flex justify-between items-center mb-6",children:(0,a.jsx)("h1",{className:"text-3xl font-bold text-gray-900 dark:text-white",children:"API Documentation"})}),(0,a.jsx)("div",{className:"bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden",children:(0,a.jsxs)("div",{className:"p-6",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold mb-4",children:"Upscalor API"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-6",children:"Integrate AI-powered image upscaling into your applications with our RESTful API."}),(0,a.jsxs)("div",{className:"mb-8",children:[(0,a.jsx)("h3",{className:"text-xl font-semibold mb-4",children:"Authentication"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-4",children:"All API requests require authentication using a JWT token or API key."}),(0,a.jsx)("div",{className:"bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4",children:(0,a.jsx)("pre",{className:"text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:`// Example request with API key
fetch('https://api.upscalor.com/upscale', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
})`})})})]}),(0,a.jsxs)("div",{className:"mb-8",children:[(0,a.jsx)("h3",{className:"text-xl font-semibold mb-4",children:"Endpoints"}),(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsx)("h4",{className:"font-medium text-lg mb-2",children:"POST /upscale"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-2",children:"Upscale an image using AI."}),(0,a.jsx)("div",{className:"bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4",children:(0,a.jsx)("pre",{className:"text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:`// Request (multipart/form-data)
{
  file: [binary image data],
  scale_factor: 2,  // 2, 4, 6, 8, or 16
  mode: "block_mode",  // block_mode, face_mode, or waifu_mode
  dynamic: 25,  // 1-50
  handfix: false,
  creativity: 0.5,  // 0-1
  resemblance: 1.5,  // 0-3
  output_format: "png"  // png, jpg, jpeg, or webp
}`})})})]}),(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsx)("h4",{className:"font-medium text-lg mb-2",children:"GET /upscale/options"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-2",children:"Get available upscale options."}),(0,a.jsx)("div",{className:"bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4",children:(0,a.jsx)("pre",{className:"text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:`// Response
{
  "modes": ["block_mode", "face_mode", "waifu_mode"],
  "mode_descriptions": {
    "block_mode": "General purpose upscaling using Real-ESRGAN model...",
    "face_mode": "Face-focused upscaling using Real-ESRGAN with face enhancement...",
    "waifu_mode": "Anime-style upscaling using Waifu Diffusion model..."
  },
  "scale_factors": [2, 4, 6, 8, 16],
  "output_formats": ["jpeg", "png", "jpg", "webp"],
  "dynamic_range": {"min": 1, "max": 50, "default": 25, "description": "..."},
  "creativity": {"min": 0, "max": 1, "default": 0.5, "description": "..."},
  "resemblance": {"min": 0, "max": 3, "default": 1.5, "description": "..."},
  "handfix": {"description": "..."},
  "powered_by": "Replicate AI",
  "api_version": "1.1.0"
}`})})})]}),(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsx)("h4",{className:"font-medium text-lg mb-2",children:"GET /models"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-2",children:"Get information about the AI models used for image upscaling."}),(0,a.jsx)("div",{className:"bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-4",children:(0,a.jsx)("pre",{className:"text-sm overflow-x-auto",children:(0,a.jsx)("code",{children:`// Response
{
  "models": {
    "real_esrgan": {
      "name": "Real-ESRGAN",
      "id": "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      "description": "A state-of-the-art image upscaling model...",
      "modes": ["block_mode", "face_mode"],
      "features": ["High-quality image upscaling", "Preserves fine details", ...],
      "best_for": ["Photographs", "Realistic images", "Portraits", "Landscapes"],
      "paper_url": "https://arxiv.org/abs/2107.10833",
      "github_url": "https://github.com/xinntao/Real-ESRGAN"
    },
    "waifu_diffusion": {
      "name": "Waifu Diffusion",
      "id": "cjwbw/waifu-diffusion:25d2f75ecda0c0bed34c806b7b70319a53a1bccad3e76902eacd3063f412330b",
      "description": "A specialized model for upscaling anime and cartoon-style images...",
      "modes": ["waifu_mode"],
      "features": ["Specialized for anime and cartoon images", ...],
      "best_for": ["Anime", "Manga", "Cartoons", "Illustrations"],
      "github_url": "https://github.com/harubaru/waifu-diffusion"
    }
  },
  "platform": {
    "name": "Replicate",
    "description": "A platform that makes it easy to run machine learning models in the cloud.",
    "website": "https://replicate.com",
    "documentation": "https://replicate.com/docs"
  },
  "version": "1.1.0"
}`})})})]})]}),(0,a.jsxs)("div",{className:"mb-8",children:[(0,a.jsx)("h3",{className:"text-xl font-semibold mb-4",children:"Rate Limits"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-4",children:"API usage is subject to the following rate limits:"}),(0,a.jsxs)("ul",{className:"list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300",children:[(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Free tier:"})," 3 requests per month, max 2x scale factor"]}),(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Pro tier:"})," 100 requests per month, all scale factors"]}),(0,a.jsxs)("li",{children:[(0,a.jsx)("strong",{children:"Enterprise tier:"})," Custom limits, contact us for details"]})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("h3",{className:"text-xl font-semibold mb-4",children:"Get Your API Key"}),(0,a.jsx)("p",{className:"text-gray-600 dark:text-gray-300 mb-4",children:"To get started with the Upscalor API, sign up for a Pro or Enterprise plan and generate your API key from the dashboard."}),(0,a.jsx)("a",{href:"/pricing",className:"inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",children:"View Pricing"})]})]})})]})}},91645:e=>{e.exports=require("net")},94735:e=>{e.exports=require("events")}};var s=require("../../webpack-runtime.js");s.C(e);var r=e=>s(s.s=e),a=s.X(0,[257,955,493],()=>r(76571));module.exports=a})();