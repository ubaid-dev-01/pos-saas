import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { sendLeadEmail } from "./emailjsService";

export async function submitLead(formData) {
  const leadId = formData?.leadId || `lead_${Date.now()}`;

  const fallbackPayload = {
    ...formData,
    leadId,
    status: "new",
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "leads"), fallbackPayload);

  try {
    const emailResponse = await sendLeadEmail({
      ...formData,
      leadId: docRef.id,
    });
    return { leadId: docRef.id, emailResponse };
  } catch (error) {
    return {
      leadId: docRef.id,
      emailError: error?.message || "Email notification failed",
    };
  }
}
