import Setting from "../models/setting.model.js";

// @desc    Get store settings (Public/Private based on need, mostly Admin or public info)
// @route   GET /api/settings
// @access  Public (or Private if hiding sensitive info, but store address is public)
export const getSettings = async (req, res, next) => {
  try {
    // Find the general settings document
    let settings = await Setting.findOne({ key: "general" });

    // If not exists, create default
    if (!settings) {
      settings = await Setting.create({ key: "general" });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const { storeName, storePhone, storeAddress } = req.body;

    let settings = await Setting.findOne({ key: "general" });
    if (!settings) {
        settings = new Setting({ key: "general" });
    }

    settings.storeName = storeName || settings.storeName;
    settings.storePhone = storePhone || settings.storePhone;
    
    if (storeAddress) {
        // Merge allowed address fields
        settings.storeAddress = {
            ...settings.storeAddress, 
            ...storeAddress
        };
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);

  } catch (error) {
    next(error);
  }
};
