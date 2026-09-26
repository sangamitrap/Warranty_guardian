const express = require('express');
const mongoose = require('mongoose');

const Item = require('../models/item');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


// ==================================================
// CREATE ITEM
// POST /api/items
// ==================================================

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      store,
      purchaseDate,
      amount,
      warrantyMonths,
      receiptUrl,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !name.trim() ||
      !purchaseDate ||
      warrantyMonths === undefined
    ) {
      return res.status(400).json({
        message: 'Name, purchase date and warranty months are required',
      });
    }

    const parsedPurchaseDate = new Date(purchaseDate);
    const months = Number(warrantyMonths);

    // Validate purchase date
    if (Number.isNaN(parsedPurchaseDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid purchase date',
      });
    }

    // Validate warranty duration
    if (!Number.isFinite(months) || months <= 0) {
      return res.status(400).json({
        message: 'Warranty months must be a valid positive number',
      });
    }

    // Validate amount
    if (amount !== undefined) {
      const parsedAmount = Number(amount);

      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          message: 'Amount must be a valid non-negative number',
        });
      }
    }

    // Calculate expiry date
    const expiresOn = new Date(parsedPurchaseDate);

    expiresOn.setMonth(
      expiresOn.getMonth() + months
    );

    // Create item
    const item = await Item.create({
      user: req.userId,
      name: name.trim(),
      category,
      store,
      purchaseDate: parsedPurchaseDate,
      amount: amount !== undefined ? Number(amount) : undefined,
      warrantyMonths: months,
      expiresOn,
      receiptUrl,
      notes,
    });

    return res.status(201).json({
      message: 'Warranty item created successfully',
      item,
    });
  } catch (error) {
    console.error('Create item error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});


// ==================================================
// GET ALL ITEMS
// GET /api/items
// ==================================================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({
      user: req.userId,
    }).sort({
      expiresOn: 1,
    });

    return res.status(200).json({
      items,
    });
  } catch (error) {
    console.error('Get items error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});


// ==================================================
// GET ONE ITEM
// GET /api/items/:id
// ==================================================

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    const item = await Item.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!item) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    return res.status(200).json({
      item,
    });
  } catch (error) {
    console.error('Get item error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});


// ==================================================
// UPDATE ITEM
// PUT /api/items/:id
// ==================================================

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    const item = await Item.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!item) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    const {
      name,
      category,
      store,
      purchaseDate,
      amount,
      warrantyMonths,
      receiptUrl,
      notes,
    } = req.body;

    if (name !== undefined) {
      item.name = name;
    }

    if (category !== undefined) {
      item.category = category;
    }

    if (store !== undefined) {
      item.store = store;
    }

    if (amount !== undefined) {
      item.amount = amount;
    }

    if (receiptUrl !== undefined) {
      item.receiptUrl = receiptUrl;
    }

    if (notes !== undefined) {
      item.notes = notes;
    }

    if (purchaseDate !== undefined) {
      const parsedPurchaseDate = new Date(purchaseDate);

      if (Number.isNaN(parsedPurchaseDate.getTime())) {
        return res.status(400).json({
          message: 'Invalid purchase date',
        });
      }

      item.purchaseDate = parsedPurchaseDate;
    }

    if (warrantyMonths !== undefined) {
      const months = Number(warrantyMonths);

      if (!Number.isFinite(months) || months < 0) {
        return res.status(400).json({
          message: 'Warranty months must be a valid positive number',
        });
      }

      item.warrantyMonths = months;
    }

    // Recalculate expiry
    const expiresOn = new Date(item.purchaseDate);

    expiresOn.setMonth(
      expiresOn.getMonth() + Number(item.warrantyMonths)
    );

    item.expiresOn = expiresOn;

    await item.save();

    return res.status(200).json({
      message: 'Warranty item updated successfully',
      item,
    });
  } catch (error) {
    console.error('Update item error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});


// ==================================================
// DELETE ITEM
// DELETE /api/items/:id
// ==================================================

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!item) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    return res.status(200).json({
      message: 'Warranty item deleted successfully',
    });
  } catch (error) {
    console.error('Delete item error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
});


module.exports = router;