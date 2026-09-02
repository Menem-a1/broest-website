import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type FooterSettings = {
  designerName: string;
  designerShowName: boolean;
  designerShowContact: boolean;
  designerContactUrl: string;
  designerFontSize: number;
  designerOpacity: number;
  facebookUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
};

const DEFAULTS: FooterSettings = {
  designerName: "",
  designerShowName: false,
  designerShowContact: false,
  designerContactUrl: "",
  designerFontSize: 12,
  designerOpacity: 0.6,
  facebookUrl: "",
  instagramUrl: "",
  whatsappUrl: "",
};

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("footer_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings({
            designerName: data.designer_name,
            designerShowName: data.designer_show_name,
            designerShowContact: data.designer_show_contact,
            designerContactUrl: data.designer_contact_url,
            designerFontSize: data.designer_font_size,
            designerOpacity: Number(data.designer_opacity),
            facebookUrl: data.facebook_url,
            instagramUrl: data.instagram_url,
            whatsappUrl: data.whatsapp_url,
          });
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
