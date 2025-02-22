// websiteController.js
const express = require('express');
const router = express.Router();
const Innovation = require("../models/innovation");
const Investor = require('../models/investor');
const Innovator = require('../models/innovator');
const Investment = require('../models/investment');
const Category = require('../models/category');
const investor = require('../models/investor');


// ✅ Get all investments
router.get("/investments", async (req, res) => {
    try {
        const investments = await Investment.find()
            .populate({
                path: "investor",
                select:
                    "firstName lastName email company photo bio city education phone",
            })
            .populate({
                path: "innovation",
                select: "name description cost image video status category createdBy",
                populate: {
                    path: "category",
                    select: "name",
                },
                populate: {
                    path: "createdBy",
                    select: "firstName lastName email bio city education phone photo",
                },
            })
            .populate({
                path: "commitment",
                select: "amount status",
            });


        if (!investments || investments.length === 0) {
            return res.status(404).json({ message: "No investments found." });
        }

        res.status(200).json(investments);
    } catch (error) {
        console.error("❌ Error fetching investments:", error);
        res.status(500).json({ message: "Failed to load investments." });
    }
}
);

// ✅ Get a single investment by ID
router.get("/investment/:id", async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id)
            .populate({
                path: "innovation",
                select: "name description cost image video status category createdBy",
                populate: [
                    {
                        path: "category",
                        select: "name",
                    },
                    {
                        path: "createdBy",
                        select: "firstName lastName email bio city education phone photo",
                    },
                ],
            })
            .populate({
                path: "commitment",
                select: "conditions status",
                populate: [
                    {
                        path: "investor",
                        select: "firstName lastName email company photo bio city education phone",
                    },
                    {
                        path: "innovator",
                        select: "firstName lastName email bio city education phone photo",
                    },
                ],
            });

        if (!investment) {
            console.log("❌ Investment not found.");
            return res.status(404).json({ message: "Investment not found." });
        }


        res.status(200).json(investment);
    } catch (error) {
        console.error("❌ Error fetching investment:", error);
        res.status(500).json({ message: "Failed to load investment details.", error });
    }
});




// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});


// Get counts of all items
router.get('/counts', async (req, res) => {
    try {
        const [innovationsCount, investorsCount, innovatorsCount, investmentsCount, categoriesCount] = await Promise.all([
            Innovation.countDocuments(),
            Investor.countDocuments(),
            Innovator.countDocuments(),
            Investment.countDocuments(),
            Category.countDocuments()
        ]);

        res.status(200).json({
            innovations: innovationsCount,
            investors: investorsCount,
            innovators: innovatorsCount,
            investments: investmentsCount,
            categories: categoriesCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching counts', error: error.message });
    }
});
// Get all innovators without passwords and include their innovations
router.get('/innovators', async (req, res) => {
    try {
        const innovators = await Innovator.find().select('-password')
            ;
        res.status(200).json(innovators);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching innovators', error: error.message });
    }
});

router.get('/investors', async (req, res) => {
    try {
        const investors = await Investor.find().select('-password')
            ;
        res.status(200).json(investors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching innovators', error: error.message });
    }
});

// Show innovator by ID
router.get('/innovator/:id', async (req, res) => {
    try {
        const innovator = await Innovator.findById(req.params.id).select('-password');
        if (!innovator) return res.status(404).json({ message: 'Innovator not found' });
        res.status(200).json(innovator);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching innovator details', error: error.message });
    }
});
// ✅ Get Innovations by Innovator ID
router.get('/innovator/:id/innovations', async (req, res) => {
    try {
        const { id } = req.params;

        // Find innovations created by this innovator
        const innovations = await Innovation.find({ createdBy: id }).populate(
            "category"
        );

        res.status(200).json(innovations);
    } catch (error) {
        console.error("❌ Error fetching innovations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
)

// Show investor by ID
// router.get('/investor/:id', async (req, res) => {
//     try {
//         const investor = await Investor.findById(req.params.id).select('-password')
//             .populate({ path: 'investments', populate: { path: 'innovation', select: 'name description' } });
//         if (!investor) return res.status(404).json({ message: 'Investor not found' });
//         res.status(200).json(investor);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching investor details', error: error.message });
//     }
// });
// Get investor with investments and related innovations
router.get('/investor/:id', async (req, res) => {
    try {
        const investor = await Investor.findById(req.params.id).select('-password');

        if (!investor) {
            return res.status(404).json({ message: 'Investor not found' });
        }
       
        // Find investments for this investor with populated innovation details
        const investments = await Investment.find({ investor: investor._id })
            .populate('innovation', 'name description')
            .populate('innovator', 'name')
            .populate('commitment', 'details amount status');

        res.status(200).json({ investor, investments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching investor details', error: error.message });
    }
});

// Get 3 random innovations with createdBy relation
router.get('/innovations', async (req, res) => {
    try {
        const innovations = await Innovation.find().populate("category createdBy");

        res.status(200).json(innovations);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching innovations", error: error.message });
    }
});

// Show innovation by ID
router.get('/innovation/:id', async (req, res) => {
    try {
        // Find the innovation details
        const innovation = await Innovation.findById(req.params.id)
            .populate('createdBy category');

        if (!innovation) {
            return res.status(404).json({ message: 'Innovation not found' });
        }

        // Find all investments related to this innovation
        const investments = await Investment.find({ innovation: req.params.id })
            .populate('investor', 'firstName lastName email')
            .populate('innovator', 'firstName lastName email')
            .populate('commitment');

        // Combine innovation and investments in a single response
        const response = {
            ...innovation.toObject(),
            investments: investments
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching innovation with investments:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});







router.get('/innovators/random', async (req, res) => {
    try {
        const randomInnovators = await Innovator.aggregate([{ $sample: { size: 3 } }]);
        res.status(200).json(randomInnovators);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching random innovators', error: error.message });
    }
});

// Get 3 random investors
router.get('/investors/random', async (req, res) => {
    try {
        const randomInvestors = await Investor.aggregate([{ $sample: { size: 3 } }]);
        res.status(200).json(randomInvestors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching random investors', error: error.message });
    }
});


// Get 3 random innovations with createdBy relation
router.get('/innovations/random', async (req, res) => {
    try {
        const randomInnovations = await Innovation.aggregate([
            { $sample: { size: 3 } },
            {
                $lookup: {
                    from: 'innovators', // Assuming your users collection is named 'users'
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            },
            {
                $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
        res.status(200).json(randomInnovations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching random innovations', error: error.message });
    }
});

module.exports = router;


