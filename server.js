import express from "express";
import axios from "axios";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ADMIN_API_VERSION = process.env.ADMIN_API_VERSION || "2024-07";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
// 4️⃣ نقطة استقبال الفورم
app.post("/create-order", async (req, res) => {
  try {
    const { name, phone, wilaya, baladiya, quantity, product_id, price } = req.body;

    // نجهز البيانات بصيغة Shopify
    const orderData = {
      order: {
        line_items: [
          {
            variant_id: product_id, // معرف المنتج
            quantity: quantity,
          },
        ],
        customer: {
          first_name: name.split(" ")[0],
          last_name: name.split(" ")[1] || "",
          phone: phone,
        },
        note: `ولاية: ${wilaya}, بلدية: ${baladiya}`,
        tags: "COD-Form",
        financial_status: "pending", // يعني الدفع عند الإستلام
      },
    };

    // نرسل الطلب إلى Shopify API
    const response = await axios.post(
      `${SHOPIFY_STORE}/admin/api/${ADMIN_API_VERSION}/orders.json`,
      orderData,
      {
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
res.status(200).json({
  success: true,
  message: "تم إرسال الطلب بنجاح ✅",
  shopify_response: response.data,
});

}
  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الطلب:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الطلب",
      error: error.response?.data || error.message,
    });
  }
});

// 5️⃣ نقطة اختبار بسيطة
app.get("/", (req, res) => {
  res.send("🚀 Shopify Order Form API يعمل بنجاح!");
});

// 6️⃣ تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ السيرفر شغال على البورت ${PORT}`));
