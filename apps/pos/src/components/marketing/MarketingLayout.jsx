import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import FloatingWhatsApp from "./FloatingWhatsApp";
import GoTopButton from "./GoTopButton";
import SiteFooter from "./SiteFooter";
import SiteNavbar from "./SiteNavbar";

export default function MarketingLayout() {
  useEffect(() => {
    document.documentElement.classList.add("mkt-active");
    return () => document.documentElement.classList.remove("mkt-active");
  }, []);

  return (
    <div className="marketing-shell min-h-screen font-geist">
      <SiteNavbar />
      <Outlet />
      <SiteFooter />
      <GoTopButton />
      <FloatingWhatsApp />
    </div>
  );
}
