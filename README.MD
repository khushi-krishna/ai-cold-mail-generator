#  AI Cold Email & Resume Generator

Generate cold emails, LinkedIn DMs, and tailored resumes using AI.

##  Features

-  Authentication with OTP verification
- AI-generated cold emails, DMs, follow-ups
-  Resume tailoring based on job description
-  Fast UI with React


-------------------------------------------------------------------------------------
##  Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB Atlas

**DevOps**
- Docker
- Docker Compose

----------------------------------------------------------------------------------
##  Architecture

Frontend (Docker) → Backend (Docker) → MongoDB Atlas (Cloud)

----------------------------------------------------------------------------------
## Database

This project uses MongoDB Atlas (cloud-hosted database).

- No local MongoDB container is required
- Backend connects using MONGO_URI from environment variables
- Ensures scalability and easy deployment

--------------------------------------------------------------------------------
##  Setup

### Prerequisites
- Docker installed

### Run the project

```bash
docker-compose up --build


 This section must be **super clear**

---

##  7. Environment Variables

```md id="x7"
##  Environment Variables

### Backend (.env)

MONGO_URI=your_mongodb_url  
JWT_SECRET=your_secret  
GROQ_API_KEY=your_key  

### Frontend (.env)

VITE_API_URL=http://localhost:3000

--------------------------------------------------------------------------------------
##  Why This Project?

This project helps job seekers:
- Improve outreach success rate
- Generate personalized communication
- Create ATS-optimized resumes

## Future Improvements

- Save generated content
- Resume scoring
- Chrome extension

