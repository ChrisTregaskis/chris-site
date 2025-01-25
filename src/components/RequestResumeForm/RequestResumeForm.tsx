import React, { useState } from "react";
import { googleDocId } from "../Terminal";
import Button from "../Button";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/context/ThemeContext";
import { useRequestCV } from "@/hooks/useRequestCV";
import { useActiveContent } from "@/hooks/useActiveContent";
import useToast from "@/hooks/useToast";

const RequestResumeForm: React.FC = () => {
  const { themeMode } = useTheme();
  const { status: requestCVStatus, setStatus } = useRequestCV();
  const { setActiveContent } = useActiveContent();
  const { showToast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const values = Object.fromEntries(formData.entries());
    setStatus("loading");

    try {
      const response = await fetch(`${import.meta.env.VITE_CHRIS_API}/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Request successful, do something here
        showToast("Chris's CV unlocked.", { scheme: "SUCCESS" });
      } else {
        // Request failed, handle errors here
        showToast(
          "Oh no! Couldn't send the email... don't worry, CV now available.",
          { scheme: "WARN" },
        );
      }

      // What ever happens, allow user to have access to CV
      setStatus("success");
      setFormSubmitted(true);
    } catch (error) {
      showToast("Oh no! request failed.", { scheme: "ERROR" });
      console.error("An error occurred:", error);
    }
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center p-2">
      <div
        className={`
          ${themeMode === ThemeMode.DARK && "bg-gray-950"} 
          rounded-lg shadow-lg h-full w-3/4 max-w-7xl flex flex-col p-4 text-textColorPrimary
        `}
      >
        {!formSubmitted && requestCVStatus !== "success" ? (
          <>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-serif mb-4">Unlock Chris's CV</h1>
              <p className="mb-4">
                Simply fill in your name and email and my CV will be unlocked
                for download. If you fancy a bit of fun; once you've done this,
                head back to the terminal and the file id will be accessible -
                you can download my CV now directly from the terminal.
                Alternatively, a button will appear and you can view/download
                directly from here.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 text-dark"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col w-full">
                  <label
                    htmlFor="firstName"
                    className="mb-2 text-textColorPrimary"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="p-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label
                    htmlFor="lastName"
                    className="mb-2 text-textColorPrimary"
                  >
                    Last Name (optional)
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 text-textColorPrimary">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="p-2 border rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="message" className="mb-2 text-textColorPrimary">
                  Additional Message (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="p-2 border rounded-md"
                  rows={4}
                ></textarea>
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
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-serif mb-4">CV Unlocked!</h1>
              <p className="mb-8">
                Thanks for unlocking my CV. You can now click "View CV" below
                or, if you fancy it... can follow the commands back on the
                terminal as the fileId will now be showing.
              </p>
            </div>
            <div className="flex w-full">
              <Button
                text="Back To Terminal"
                type="secondary"
                handleClick={() => setActiveContent("terminal")}
              />
              <Button
                text="View CV"
                handleClick={() =>
                  window.open(
                    `https://drive.google.com/file/d/${googleDocId}/view`,
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestResumeForm;
