const prisma = require("../lib/prisma");
// this function initialze plan info and payment info on our system before having payment by user
// when a user successfully payment completed then we update payment status
let initiatedPlanOrder = async (
  paymentInfo,
  userInfo,
  planInfo,
  paymentMethod
) => {
  const { pidx } = paymentInfo;
  const { id, email } = userInfo;
  const { plan_fee, plan_name } = planInfo;
  // console.log(paymentInfo, userInfo, planInfo, paymentMethod);
  try {
    const purchaseInitialize = await prisma.purchase.create({
      data: {
        email: email,
        pidx: pidx,
        transactionId: "",
        purchaseOrderId: "test12",
        purchaseOrderName: plan_name,
        amount: Number(plan_fee),
        paymentStatus: "Initiated",
        userAccessStatus: false,
        paymentMethod: paymentMethod,
        subscriptionStartDate: "",
        subscriptionEndDate: "",
        user: {
          connect: {
            id: id,
          },
        },
      },
    });
    return purchaseInitialize;
  } catch (err) {
    console.log(err);
  }
};

// checking pidx is register or not on our purchase table
let checkValidPidx = async (pidx) => {
  try {
    const pidxResponse = await prisma.purchase.findFirst({
      where: {
        pidx: pidx,
      },
    });
    return pidxResponse;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { initiatedPlanOrder, checkValidPidx };
