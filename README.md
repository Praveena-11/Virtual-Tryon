🎯 AI-Powered Virtual Try-On with Style Assistant

This project is a full-stack AI-powered virtual try-on application that enables users to upload a casual photo and visualize garments realistically using a diffusion-based IDM-VTON model. The system preserves body pose, lighting, and garment texture through pose detection and human segmentation techniques.

Built with React (Frontend), Node.js/Express (Backend), and Python AI service, the application integrates HuggingFace-hosted IDM-VTON for high-resolution (768×1024) garment transfer. The architecture ensures clean separation between UI, API handling, and AI inference layers.

🚀 Key Features

Diffusion-based garment transfer (IDM-VTON)

Pose detection & human parsing for accurate alignment

High-resolution photorealistic output

RESTful API integration

AI styling assistant for outfit recommendations

Works with single casual user photos

🛠 Tech Stack

Frontend: React.js

Backend: Node.js, Express.js

AI Service: Python, Gradio Client

Model: IDM-VTON (Diffusion-based)

Integration: HuggingFace Spaces API
