/**
 * Cấu hình Tailwind dùng CHUNG cho mọi trang.
 * Trước đây khối này bị sao chép y hệt vào 11 file HTML — nay chỉ còn 1 nơi duy nhất.
 * Muốn đổi màu/font toàn web: sửa tại đây.
 */
tailwind.config = {
  "darkMode": "class",
  "theme": {
    "extend": {
      "colors": {
        "secondary-fixed-dim": "#6ddd81",
        "on-surface-variant": "#3f493f",
        "inverse-surface": "#2e3130",
        "secondary": "#006e2c",
        "on-secondary-fixed-variant": "#005320",
        "inverse-on-surface": "#eff1ef",
        "surface-bright": "#f8faf8",
        "on-primary-container": "#b4ffba",
        "on-primary": "#ffffff",
        "surface-container-low": "#f2f4f2",
        "surface-dim": "#d8dad9",
        "on-background": "#191c1b",
        "on-tertiary-fixed-variant": "#5b4300",
        "on-error-container": "#93000a",
        "background": "#f8faf8",
        "error": "#ba1a1a",
        "surface-container": "#eceeec",
        "on-error": "#ffffff",
        "tertiary-fixed-dim": "#f7be23",
        "surface-tint": "#056d2e",
        "on-primary-fixed-variant": "#005320",
        "surface-variant": "#e1e3e1",
        "outline-variant": "#bfcabb",
        "surface-container-high": "#e6e9e7",
        "surface-container-highest": "#e1e3e1",
        "on-primary-fixed": "#002109",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00722f",
        "tertiary-container": "#886600",
        "secondary-container": "#86f898",
        "tertiary-fixed": "#ffdf9d",
        "surface": "#f8faf8",
        "primary-fixed": "#9cf7a7",
        "on-tertiary-fixed": "#251a00",
        "on-surface": "#191c1b",
        "error-container": "#ffdad6",
        "on-tertiary": "#ffffff",
        "tertiary": "#6a4f00",
        "on-tertiary-container": "#ffebc7",
        "secondary-fixed": "#89fa9b",
        "surface-container-lowest": "#ffffff",
        "outline": "#6f7a6e",
        "primary": "#006127",
        "inverse-primary": "#80da8d",
        "primary-fixed-dim": "#80da8d",
        "primary-container": "#1e7b3a",
        "on-secondary-fixed": "#002108"
      },
      "borderRadius": {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      "spacing": {
        "space-sm": "0.75rem",
        "space-lg": "2rem",
        "space-md": "1.25rem",
        "margin-mobile": "1.25rem",
        "space-xs": "0.375rem",
        "space-xl": "3rem",
        "margin": "2.5rem",
        "gutter-mobile": "1rem",
        "gutter": "1.5rem"
      },
      "fontFamily": {
        "headline-lg": [
          "Quicksand"
        ],
        "headline-md": [
          "Quicksand"
        ],
        "label-lg": [
          "Quicksand"
        ],
        "body-lg": [
          "Nunito Sans"
        ],
        "headline-lg-mobile": [
          "Quicksand"
        ],
        "body-md": [
          "Nunito Sans"
        ],
        "label-md": [
          "Quicksand"
        ],
        "label-sm": [
          "Quicksand"
        ],
        "headline-xl-mobile": [
          "Quicksand"
        ],
        "body-sm": [
          "Nunito Sans"
        ],
        "headline-sm": [
          "Quicksand"
        ],
        "headline-xl": [
          "Quicksand"
        ]
      },
      "fontSize": {
        "headline-lg": [
          "32px",
          {
            "lineHeight": "44px",
            "fontWeight": "700"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "34px",
            "fontWeight": "700"
          }
        ],
        "label-lg": [
          "18px",
          {
            "lineHeight": "26px",
            "fontWeight": "700"
          }
        ],
        "body-lg": [
          "20px",
          {
            "lineHeight": "32px",
            "fontWeight": "500"
          }
        ],
        "headline-lg-mobile": [
          "26px",
          {
            "lineHeight": "36px",
            "fontWeight": "700"
          }
        ],
        "body-md": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "500"
          }
        ],
        "label-md": [
          "16px",
          {
            "lineHeight": "22px",
            "fontWeight": "600"
          }
        ],
        "label-sm": [
          "13px",
          {
            "lineHeight": "18px",
            "fontWeight": "600"
          }
        ],
        "headline-xl-mobile": [
          "30px",
          {
            "lineHeight": "40px",
            "fontWeight": "700"
          }
        ],
        "body-sm": [
          "15px",
          {
            "lineHeight": "22px",
            "fontWeight": "400"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "30px",
            "fontWeight": "700"
          }
        ],
        "headline-xl": [
          "40px",
          {
            "lineHeight": "52px",
            "fontWeight": "700"
          }
        ]
      }
    }
  }
};
