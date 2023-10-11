const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// add note in online class
exports.addNoteAtOnlineClass = async (req, res) => {
  try {
    let { noteContent, onlineClassId, teacherEmail } = req.body;

    if (!noteContent || !onlineClassId || !teacherEmail) {
      return res.status(400).type("json").json({ error: "Bad request" });
    }

    let onlineClass = await prisma.onlineClass.findUnique({
      where: {
        id: onlineClassId,
      },
    });
    // checking given class presend or not in DB
    if (!onlineClass) {
      return res
        .status(404)
        .type("json")
        .json({ error: "this class does not found" });
    }
    // Check if the teacherEmail in the online class matches the provided teacherEmail
    if (onlineClass?.teacherEmail !== teacherEmail) {
      return res
        .status(403)
        .type("json")
        .json({ error: "You are not authorized to add note in this class" });
    }
    // adding note at onlineclass
    let addNote = await prisma.note.create({
      data: {
        content: noteContent,
        onlineClassId: onlineClassId,
      },
    });

    res.status(201).type("json").json(addNote);
  } catch (err) {
    res.status(200).type("json").json("internel server error");
  }
};

// delete note from online class
exports.deleteNoteFromOnlineClass = async (req, res) => {
  try {
    let { id, onlineClassId, teacherEmail } = req.body;
    // validating req variable
    if (!id || !onlineClassId || !teacherEmail) {
      return res
        .status(400)
        .type("json")
        .json({ error: "Bad Request, Please Try Again" });
    }
    // searching the onlineclass
    let onlineClassResponse = await prisma.onlineClass.findUnique({
      where: {
        id: onlineClassId,
      },
    });
    // authenticating the onlineclass present or not
    if (!onlineClassResponse) {
      return res
        .status(400)
        .type("json")
        .json({ error: "Bad Request, Please Try Again" });
    }
    // authenticating for authorize user
    if (onlineClassResponse?.teacherEmail !== teacherEmail) {
      return res
        .status(401)
        .type("json")
        .json({ error: "!You Are An Unauthorized User" });
    }
    // searching the notice
    let onlineClassNoticeResponse = await prisma.note.findFirst({
      where: {
        id: id,
        onlineClassId: onlineClassId,
      },
    });
    // authenticating the notice  present or not
    if (!onlineClassNoticeResponse) {
      return res
        .status(404)
        .type("json")
        .json({ error: "This Notice Do Not Found" });
    }
    // deleting notice from DB
    let onlineClassNoticeDeleteResponse = await prisma.note.delete({
      where: {
        id: id,
      },
    });
    // if notice does not deleted
    if (!onlineClassNoticeDeleteResponse) {
      return res
        .status(500)
        .type("json")
        .json({ error: "This Notice Does Not Delete, Please Try Again" });
    }

    return res
      .status(200)
      .type("json")
      .json({ message: `${id} Notice Successfully Deleted` });
  } catch (err) {
    res.status(500).type("json").json({ error: "Internel Server Error" });
  }
};
