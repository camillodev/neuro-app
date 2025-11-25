import { Router } from 'express';
import { MorningRoutineController } from '../controllers/morning-routine.controller';
import { EmotionalStateController } from '../controllers/emotional-state.controller';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Instanciar controllers
const morningRoutineController = new MorningRoutineController();
const emotionalStateController = new EmotionalStateController();
const reportController = new ReportController();

// ===== ROTAS DA ROTINA DA MANHÃ =====
router.post(
  '/morning-routine/start',
  requireAuth,
  (req, res) => morningRoutineController.start(req, res)
);

router.post(
  '/morning-routine/finish',
  requireAuth,
  (req, res) => morningRoutineController.finish(req, res)
);

router.get(
  '/morning-routine/active',
  requireAuth,
  (req, res) => morningRoutineController.getActive(req, res)
);

router.get(
  '/morning-routine/today',
  requireAuth,
  (req, res) => morningRoutineController.getToday(req, res)
);

router.get(
  '/morning-routine/best-time-week',
  requireAuth,
  (req, res) => morningRoutineController.getBestTimeWeek(req, res)
);

// ===== ROTAS DO ESTADO EMOCIONAL =====
router.post(
  '/emotional-state/save',
  requireAuth,
  (req, res) => emotionalStateController.save(req, res)
);

router.get(
  '/emotional-state/today',
  requireAuth,
  (req, res) => emotionalStateController.getToday(req, res)
);

router.get(
  '/emotional-state/date/:date',
  requireAuth,
  (req, res) => emotionalStateController.getByDate(req, res)
);

// ===== ROTAS DOS RELATÓRIOS =====
router.post(
  '/reports/summary',
  requireAuth,
  (req, res) => reportController.getSummary(req, res)
);

router.post(
  '/reports/export',
  requireAuth,
  (req, res) => reportController.exportPDF(req, res)
);

router.post(
  '/reports/share',
  requireAuth,
  (req, res) => reportController.createShareToken(req, res)
);

router.get(
  '/reports/tokens',
  requireAuth,
  (req, res) => reportController.getShareTokens(req, res)
);

router.delete(
  '/reports/tokens/:tokenId',
  requireAuth,
  (req, res) => reportController.deleteShareToken(req, res)
);

// Rota pública - não requer autenticação
router.get(
  '/reports/public/:token',
  (req, res) => reportController.getPublicReport(req, res)
);

export default router;
