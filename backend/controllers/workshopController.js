import Workshop from '../models/workshopModel.js';

/**
 * @desc    Get all workshops for a student
 * @route   GET /api/workshops
 * @access  Private (Student)
 */
export const getWorkshops = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const workshops = await Workshop.find(
      { email_id: userEmail },
      { 'proof.data': 0 } // Exclude binary data from initial fetch
    ).sort({ date: -1 });

    const incompleteWorkshops = workshops.filter(workshop => 
      !workshop.proof?.fileName
    );

    const completeWorkshops = workshops.filter(workshop => 
      workshop.proof?.fileName 
    );

    res.status(200).json({
      success: true,
      data: {
        incomplete: incompleteWorkshops,
        complete: completeWorkshops
      }
    });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workshops',
      error: error.message
    });
  }
};

/**
 * @desc    Add new workshop
 * @route   POST /api/upload/workshop
 * @access  Private (Student)
 */
export const uploadWorkshop = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      title,
      organizer,
      date,
      topic,
      mode,
      duration
    } = req.body;

    const workshopData = {
      email_id: userEmail,
      title,
      organizer,
      date,
      topic,
      mode,
      duration,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const newWorkshop = new Workshop(workshopData);
    const savedWorkshop = await newWorkshop.save();

    res.status(201).json({
      success: true,
      data: savedWorkshop,
      message: 'Workshop added successfully'
    });
  } catch (error) {
    console.error('Error adding workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding workshop',
      error: error.message
    });
  }
};

/**
 * @desc    Update workshop
 * @route   PUT /api/update/workshop/:id
 * @access  Private (Student)
 */
export const updateWorkshop = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const workshopId = req.params.id;
    const {
      title,
      organizer,
      date,
      topic,
      mode,
      duration,
    } = req.body;

    // Verify workshop belongs to user
    const existingWorkshop = await Workshop.findOne({
      _id: workshopId,
      email_id: userEmail
    });

    if (!existingWorkshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found or unauthorized'
      });
    }

    const workshopData = {
      title,
      organizer,
      date,
      topic,
      mode,
      duration,
      ...(req.file && {
        proof: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
        },
      }),
    };

    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      workshopId,
      { $set: workshopData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedWorkshop,
      message: 'Workshop updated successfully'
    });
  } catch (error) {
    console.error('Error updating workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workshop',
      error: error.message
    });
  }
};

/**
 * @desc    Download workshop certificate
 * @route   GET /api/download/workshop/:id
 * @access  Private (Student)
 */
export const downloadWorkshopProof = async (req, res) => {
  try {
    const workshop = await Workshop.findOne({
      _id: req.params.id,
      email_id: req.user.email
    });

    if (!workshop || !workshop.proof?.data) {
      return res.status(404).json({
        success: false,
        message: 'Proof not found or unauthorized'
      });
    }

    res.set({
      'Content-Type': workshop.proof.contentType,
      'Content-Disposition': `attachment; filename="${workshop.proof.fileName}"`
    });
    res.send(workshop.proof.data);
  } catch (error) {
    console.error('Error downloading workshop proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading proof',
      error: error.message
    });
  }
};

/**
 * @desc    Delete workshop
 * @route   DELETE /api/workshop/:id
 * @access  Private (Student)
 */
export const deleteWorkshop = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const workshopId = req.params.id;

    const deletedWorkshop = await Workshop.findOneAndDelete({
      _id: workshopId,
      email_id: userEmail
    });

    if (!deletedWorkshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workshop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workshop:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workshop',
      error: error.message
    });
  }
};