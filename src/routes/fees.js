const { Router } = require('express');
const { 
  postFee, 
  computeTransactionFee, 
  flush
} = require('../controllers/fees');

const router = Router();

router.get('/', (req, res) => res.send('API running...'));
router.post('/fees', postFee);
router.post('/compute-transaction-fee', computeTransactionFee);
router.delete('/flush', flush);

module.exports = router;