import prisma from "../lib/prisma.js";

// ==================== GET ALL USERS (Admin Only) ====================
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

// ==================== GET SINGLE USER (Admin Only) ====================
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

// ==================== UPDATE USER ====================
export const updateUser = async (req, res) => {
  const userId = req.user.id; // مستخدم حالياً من Clerk
  const { avatar, username, email, role, ...inputs } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...inputs,
        ...(avatar && { avatar }),
        ...(username && { username }),
        ...(email && { email }),
        ...(role && req.user.role === "admin" ? { role } : {}), // فقط الادمن يغير role
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update user!" });
  }
};

// ==================== DELETE USER ====================
export const deleteUser = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete user!" });
  }
};

// ==================== SAVE / UNSAVE POST ====================
export const savePost = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.body;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (savedPost) {
      await prisma.savedPost.delete({ where: { id: savedPost.id } });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: { userId, postId },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save/unsave post!" });
  }
};

// ==================== GET PROFILE POSTS ====================
export const profilePosts = async (req, res) => {
  const userId = req.user.id;

  try {
    const userPosts = await prisma.post.findMany({
      where: { userId },
    });

    const saved = await prisma.savedPost.findMany({
      where: { userId },
      include: { post: true },
    });

    const savedPosts = saved.map((item) => item.post);

    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};
