// routes/bloodCenter.route.js
router.post("/add", async (req, res) => {
  try {
    const newCenter = new BloodCenter(req.body);
    await newCenter.save();
    res.status(201).json({ message: "Blood Center Added Successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});