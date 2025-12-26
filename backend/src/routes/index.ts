import { Router } from 'express';
import { MorningRoutineController } from '../controllers/morning-routine.controller';
import { EmotionalStateController } from '../controllers/emotional-state.controller';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth';
import { syncUser } from '../middleware/sync-user';

const router = Router();

// Instanciar controllers
const morningRoutineController = new MorningRoutineController();
const emotionalStateController = new EmotionalStateController();
const reportController = new ReportController();

// Middleware para sincronizar usuário em todas as rotas protegidas
const authMiddleware = [requireAuth, syncUser];

// ===== ROTAS DA ROTINA DA MANHÃ =====
router.post(
  '/morning-routine/start',
  authMiddleware,
  (req, res) => morningRoutineController.start(req, res)
);

router.post(
  '/morning-routine/finish',
  authMiddleware,
  (req, res) => morningRoutineController.finish(req, res)
);

router.get(
  '/morning-routine/active',
  authMiddleware,
  (req, res) => morningRoutineController.getActive(req, res)
);

router.get(
  '/morning-routine/today',
  authMiddleware,
  (req, res) => morningRoutineController.getToday(req, res)
);

router.get(
  '/morning-routine/best-time-week',
  authMiddleware,
  (req, res) => morningRoutineController.getBestTimeWeek(req, res)
);

// ===== ROTAS DO ESTADO EMOCIONAL =====
router.post(
  '/emotional-state/save',
  authMiddleware,
  (req, res) => emotionalStateController.save(req, res)
);

router.get(
  '/emotional-state/today',
  authMiddleware,
  (req, res) => emotionalStateController.getToday(req, res)
);

router.get(
  '/emotional-state/date/:date',
  authMiddleware,
  (req, res) => emotionalStateController.getByDate(req, res)
);

// ===== ROTAS DOS RELATÓRIOS =====
router.post(
  '/reports/summary',
  authMiddleware,
  (req, res) => reportController.getSummary(req, res)
);

router.post(
  '/reports/export',
  authMiddleware,
  (req, res) => reportController.exportPDF(req, res)
);

router.post(
  '/reports/share',
  authMiddleware,
  (req, res) => reportController.createShareToken(req, res)
);

router.get(
  '/reports/tokens',
  authMiddleware,
  (req, res) => reportController.getShareTokens(req, res)
);

router.delete(
  '/reports/tokens/:tokenId',
  authMiddleware,
  (req, res) => reportController.deleteShareToken(req, res)
);

// Rota pública - não requer autenticação
router.get(
  '/reports/public/:token',
  (req, res) => reportController.getPublicReport(req, res)
);

export default router;
