// src/Theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#f0f4f8" },
          100: { value: "#d9e2ec" },
          200: { value: "#bcccdc" },
          300: { value: "#9fb3c8" },
          400: { value: "#829ab1" },
          500: { value: "#627d98" },
          600: { value: "#486581" },
          700: { value: "#334e68" },
          800: { value: "#243b53" },
          900: { value: "#102a43" },
        },
      },
      fonts: {
        heading: { value: `'Inter', sans-serif` },
        body: { value: `'Inter', sans-serif` },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "{colors.white}", _dark: "{colors.gray.950}" },
          },
          subtle: {
            value: { _light: "{colors.brand.50}", _dark: "{colors.brand.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.800}" },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: "{colors.brand.900}", _dark: "{colors.gray.50}" },
          },
          muted: {
            value: { _light: "{colors.brand.600}", _dark: "{colors.brand.300}" },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
        },
        accent: {
          DEFAULT: {
            value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" },
          },
          fg: {
            value: { _light: "{colors.white}", _dark: "{colors.brand.900}" },
          },
        },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: "medium",
          borderRadius: "lg",
        },
        variants: {
          variant: {
            solid: {
              bg: "accent",
              color: "accent.fg",
              _hover: { opacity: 0.9 },
            },
            outline: {
              borderColor: "border",
              color: "fg",
              _hover: { bg: "bg.subtle" },
            },
            ghost: {
              color: "fg.muted",
              _hover: { bg: "bg.muted" },
            },
          },
        },
      },
      heading: {
        base: {
          color: "fg",
          fontWeight: "semibold",
        },
      },
    },
    slotRecipes: {
      card: {
        slots: ["root", "header", "body", "footer"],
        base: {
          root: {
            bg: "bg",
            borderWidth: "1px",
            borderColor: "border",
            borderRadius: "xl",
            boxShadow: "sm",
          },
          header: {
            color: "fg",
          },
          body: {
            color: "fg",
          },
          footer: {
            borderTopWidth: "1px",
            borderColor: "border",
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)