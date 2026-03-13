from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ai_verifier import MultiLevelVerifier

app = FastAPI(title="Decentralized AI News API")
verifier = MultiLevelVerifier()

class NewsSubmission(BaseModel):
    user_id: str
    content: str
    location: str

@app.post("/api/v1/chatbot/submit")
async def submit_news(submission: NewsSubmission):
    """
    Endpoint for AI chatbots to submit real-time incident reports.
    Accelerates coverage speed while filtering fake news.
    """
    if not submission.content:
        raise HTTPException(status_code=400, detail="Content cannot be empty.")

    # Run the submission through the multi-level verification pipeline
    analysis_result = verifier.analyze_submission(
        content=submission.content, 
        source=submission.user_id
    )

    if analysis_result["status"] == "verified":
        # In a full build, this would push to a decentralized cloud database here
        return {
            "message": "Incident reported and verified successfully. Coverage accelerated.",
            "data": analysis_result
        }
    else:
        # Blocked by the 95% filter
        return {
            "message": "Submission rejected by ecosystem integrity protocols.",
            "data": analysis_result
        }
