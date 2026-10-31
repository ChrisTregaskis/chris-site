/**
 *
 * Original commands:
 * https://drive.usercontent.google.com/u/0/uc?id=1AZSv0lZslUnKFXBZXfNR6NeZ1FUkLonj&export=download
 *
 * cd ~/Downloads/
 * filename="ChrisTregaskisResume.pdf"
 * fileId="1IorDwgu09TA9pEM94Rdzo2-y1qFiMQaN"
 * curl -L "https://drive.usercontent.google.com/download?id=${fileId}&export=download" --output "${filename}"
 * open "${filename}"
 * clear
 */
export const changeDir = [
  { text: "cd ", className: "text-[#FE4450]" },
  { text: "~/Downloads/", className: "text-[#BBBBBB]" },
];

export const filename = [
  { text: "filename", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  { text: "ChrisTregaskisResume.pdf", className: "text-[#d2691e]" },
];

export const url = [
  { text: "url", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  {
    text: `"${"https://drive.usercontent.google.com/download?id=${"}`,
    className: "text-[#d2691e]",
  },
  { text: "fileId", className: "text-[#ff57c8]" },
  { text: `}&export=download"`, className: "text-[#d2691e]" },
];

export const curlCommand = [
  { text: "curl", className: "text-[#FE4450]" },
  { text: " -", className: "text-[#fff]" },
  { text: "L ", className: "text-[#ff57c8]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "url", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" },
  { text: " --", className: "text-[#fff]" },
  { text: "output ", className: "text-[#ff57c8]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "filename", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" },
];

export const openResume = [
  { text: "open ", className: "text-[#FE4450]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "filename", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" },
];

export const clearTerminal = [{ text: "clear", className: "text-[#FE4450]" }];
