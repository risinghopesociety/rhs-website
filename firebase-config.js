// ============================================================
// RISING HOPE SOCIETY — Firebase + Cloudinary Configuration
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyArd3DU3G4thncYaGuKSEseusduNSMORzs",
  authDomain: "rising-hope-society-pk.firebaseapp.com",
  projectId: "rising-hope-society-pk",
  storageBucket: "rising-hope-society-pk.firebasestorage.app",
  messagingSenderId: "371234102504",
  appId: "1:371234102504:web:a8bf7d8cc51d1fd797fd5d"
};

const CLOUDINARY_CLOUD = "dt9yspaw7";
const CLOUDINARY_PRESET = "rhs-upload";
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}`;

// Upload image to Cloudinary
async function uploadToCloudinary(file, folder="rhs/members") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  fd.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST", body: fd
  });
  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  throw new Error(data.error?.message || "Upload failed");
}

function cloudImg(url, w=400) {
  if (!url) return "images/default.png";
  if (url.startsWith("http")) return url;
  return `${CLOUDINARY_BASE}/image/upload/w_${w},h_${w},c_fill,q_auto,f_auto/${url}`;
}
