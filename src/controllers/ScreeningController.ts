import type { Request, Response, NextFunction } from 'express';
import type { ScreeningOrchestratorService } from '../services/ScreeningOrchestratorService';

export class ScreeningController {
  constructor(private readonly orchestrator: ScreeningOrchestratorService) {}

  /**
   * POST /api/screenings/evaluate/:jobId
   * Triggers a full AI screening run: fetches all profiles, calls Gemini batch evaluation,
   * saves and returns the ranked results.
   */
  evaluate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const results = await this.orchestrator.runScreening(jobId);
      res.json({
        success: true,
        message: `Evaluation complete. ${results.length} candidate(s) ranked.`,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/screenings/:jobId/shortlist
   * Returns the top-ranked candidates with their AI reasoning.
   * Optional query param: ?topN=5 (default 10)
   */
  getShortlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const topN = req.query.topN ? parseInt(req.query.topN as string, 10) : 10;
      const shortlist = await this.orchestrator.getShortlist(jobId, topN);
      res.json({ success: true, data: shortlist });
    } catch (err) {
      next(err);
    }
  };
}
