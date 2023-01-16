const prisma = require("../lib/prisma");

function extractToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

const verifyToken = async (req, res, next) => {
  const token = extractToken(req);
  // req.body.token || req.query.token || req.headers["x-access-token"];
  // console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ error: "Unauthorized access - No apiKey found" });
  }
  try {
    const result = await prisma.session.findMany({
      where: {
        sessionToken: token,
      },
    });
    if (token === result[0].sessionToken) {
      return next();
    } else {
      throw new Error();
    }
  } catch (err) {
    console.log(err);
    return res.status(403).json({ access: "Forbidden" });
  }
};
module.exports = verifyToken;
