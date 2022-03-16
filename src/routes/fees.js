const { Router } = require('express');
const { postFee, computeTransactionFee } = require('../controllers/fees');

const router = Router();

router.get('/', (req, res) => res.send('API running...'));
router.post('/fees', postFee);
router.post('/compute-transaction-fee', computeTransactionFee)

module.exports = router;