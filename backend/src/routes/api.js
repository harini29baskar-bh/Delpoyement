
// ==========================================
// APPROVE STUDENT REQUEST
// ==========================================

r.post("/admin/requests/:id/approve", auth, adminOnly, async (req, res) => {
  try {
    // 1. Find the student access request
    const request = await AccessRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been processed"
      });
    }

    // 2. Find or create the student account
    let user = await User.findOne({
      email: request.email
    });

    if (!user) {
      user = await User.create({
        name: request.name,
        email: request.email,
        role: "student",
        status: "pending_activation"
      });
    }

    // 3. Generate a secure activation token
    const raw = crypto.randomBytes(32).toString("hex");

    // Remove previous activation tokens
    await Token.deleteMany({
      userId: user._id,
      type: "activation"
    });

    // Save the hashed token in MongoDB
    await Token.create({
      userId: user._id,
      tokenHash: hash(raw),
      type: "activation",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    // 4. Update the access request
    request.status = "approved";
    await request.save();

    // 5. Record the admin action
    await AuditLog.create({
      actorId: req.user._id,
      action: "student_approved",
      targetId: user._id
    });

    // 6. Prepare activation link
    const activationUrl =
      `${process.env.CLIENT_URL}/activate?token=${raw}`;

    // 7. Attempt to send activation email
    let emailSent = false;

    try {
      await sendLinkEmail({
        to: user.email,
        subject: "Activate your V2 CodeZero account",
        url: activationUrl
      });

      emailSent = true;

    } catch (emailError) {
      console.error(
        "Activation email failed:",
        emailError.message
      );
    }

    // 8. Return successful approval response
    return res.status(200).json({
      success: true,
      emailSent,
      message: emailSent
        ? "Student approved. Activation email sent."
        : "Student approved, but email delivery failed. Use the activation link below.",
      activationUrl: emailSent ? undefined : activationUrl
    });

  } catch (error) {
    console.error("Student approval error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve student request",
      error: error.message
    });
  }
});
