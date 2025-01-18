import React, { useState } from "react";
import { googleDocId } from "../Terminal";
import Button from "../Button";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/context/ThemeContext";
import { useRequestCV } from "@/hooks/useRequestCV";
import { toast } from "react-toastify";

const RequestResumeForm: React.FC = () => {
  const { themeMode } = useTheme();
  const { status: requestCVStatus, setStatus } = useRequestCV();
  const [ formSubmitted, setFormSubmitted ] = useState(false);

  const handleSubmit = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const values = Object.fromEntries(formData.entries());
    console.log("TEST_RUN: Form values:", values);
    setStatus("loading");

    try {
      // todoCT: Setup endpoint url in a .env file
      const apiUrl = "https://12345.execute-api.eu-west-2.amazonaws.com/test"; 

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Request successful, do something here
        toast.success("Email sent successfully! The CV should be arriving in your inbox any moment.");
        setStatus("success");
        setFormSubmitted(true);
      } else {
        // Request failed, handle errors here
        toast.error("Oh no! Couldn't send the email.");
        setStatus("error");
      } 
    } catch (error) {
      toast.error("Oh no! request failed.");
      console.error('An error occurred:', error);
    }
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center p-2">
      <div className={`
          ${themeMode === ThemeMode.DARK && "bg-gray-950"} 
          rounded-lg shadow-lg h-full w-3/4 max-w-7xl flex flex-col p-4 text-textColorPrimary
        `}>
        {!formSubmitted && requestCVStatus !== "success" ? (
          <>
            <h1 className="text-4xl font-serif mb-4">Request Chris's CV</h1>
            <p className="mb-4">
              Simply fill in your name and email and my CV will be sent to you. If you fancy a bit of fun; once you've done this, head back to the terminal and the file id will be accessible - you can download my CV now directly from the terminal. Alternatively, a button will appear and you can view/download directly from here.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-dark">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col w-full">
                  <label htmlFor="firstName" className="mb-2 text-textColorPrimary">First Name</label>
                  <input type="text" id="firstName" name="firstName" required className="p-2 border rounded-md" />
                </div>
                <div className="flex flex-col w-full">
                  <label htmlFor="lastName" className="mb-2 text-textColorPrimary">Last Name (optional)</label>
                  <input type="text" id="lastName" name="lastName" className="p-2 border rounded-md" />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 text-textColorPrimary">Email Address</label>
                <input type="email" id="email" name="email" required className="p-2 border rounded-md" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="message" className="mb-2 text-textColorPrimary">Additional Message</label>
                <textarea id="message" name="message" className="p-2 border rounded-md" rows={4}></textarea>
              </div>
              <div>
                <div className="flex justify-center">
                  <Button
                    htmlType="submit"
                    text="Submit"
                    loading={requestCVStatus === "loading"}
                  />
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="mb-4">
              Thanks for requesting my CV. It's on its way to your inbox.
            </p>
            <p className="mb-8">
              Alternatively, follow the commands on the terminal to download directly via your terminal.
            </p>
            <div className="flex w-full">
              <Button
                text="Back To Terminal"
                type="secondary"
                handleClick={() => {
                  // todoCT: handle back to terminal!
                }}
              />
              <Button
                text="View CV"
                handleClick={() => window.open(`https://drive.google.com/file/d/${googleDocId}/view`)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestResumeForm;