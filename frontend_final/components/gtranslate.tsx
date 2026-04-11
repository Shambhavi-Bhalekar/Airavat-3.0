//@ts-nocheck
"use client";

import React, { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const GTranslate = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!document.querySelector("#google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "zh-CN,zh-TW,en,sd,hi,gu,mr,ta,fr,ja,de,ru",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    addGoogleTranslateScript();
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "0.2rem",
        opacity: 1,
        zIndex: 1000,
        backgroundColor: "white",
        borderRadius: "5px",
        padding: "0.5rem",
      }}
    ></div>
  );
};

export default GTranslate;