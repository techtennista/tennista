"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { InquiryForm } from "@/components/sections/inquiry-form";
import { Container } from "@/components/ui/container";

const formats = [
  "Tennis kits and Equipment (Tennis Rackets, Bags, Shoes, Balls, Nets etc)",
  "Product donations, Gift items and Marketing Collateral",
  "Competition Prizes (Trophies, Medals, Cheques)",
  "Educational Scholarships",
  "Financial support",
  "Volunteer mobilization",
  "Grants and Donations",
];

function SalesIcon() {
  return (
    <svg viewBox="0 0 71 53" className="block h-[3.3125rem] w-auto self-start" aria-hidden>
      <path
        d="M62.0528 44.6924V47.6336C62.0528 50.2879 59.9007 52.44 57.2464 52.44H4.8064C2.15212 52.44 0 50.2879 0 47.6336V44.6924H4.08903V14.204C4.08903 11.7649 6.02594 9.82802 8.46501 9.82802H25.4668C25.1081 11.2628 24.8929 12.7692 24.8929 14.3475C24.8929 14.8496 24.8929 15.2801 24.9646 15.7822H9.97149V44.7641H25.1798V45.051C25.1798 45.9836 25.8972 46.701 26.8298 46.701H35.1513C36.0839 46.701 36.8013 45.9836 36.8013 45.051V44.7641H52.0096V32.3535H55.8834C56.6008 32.3535 57.3181 32.2818 58.0355 32.2101V44.6924H62.0528ZM70.1591 14.3475C70.1591 22.2386 63.7028 28.6949 55.8117 28.6949H46.1271L39.5273 35.2948C39.0969 35.7252 38.3077 35.4382 38.3077 34.7926V27.9776C32.6405 26.1124 28.4797 20.7321 28.4797 14.3475C28.4797 6.45636 34.9361 0 42.8272 0H55.8117C63.7745 0 70.1591 6.45636 70.1591 14.3475ZM51.7226 13.5584C51.077 13.1997 50.3596 12.9127 49.6422 12.6258C49.2118 12.4823 48.8531 12.2671 48.4944 11.9801C47.7771 11.4062 47.9205 10.5454 48.7097 10.1867C48.9249 10.115 49.1401 10.0432 49.427 10.0432C50.3596 9.97149 51.2205 10.1867 52.0813 10.5454C52.5117 10.7606 52.6552 10.6889 52.7987 10.2584C52.9422 9.82802 53.0856 9.32585 53.2291 8.89543C53.3008 8.60848 53.2291 8.39327 52.9422 8.24979C52.44 8.03458 51.8661 7.81937 51.2922 7.74763C50.5031 7.60416 50.5031 7.60416 50.5031 6.88679C50.5031 5.81073 50.5031 5.81073 49.427 5.81073C49.2836 5.81073 49.1401 5.81073 48.9249 5.81073C48.4227 5.81073 48.351 5.88246 48.351 6.38462C48.351 6.59984 48.351 6.81505 48.351 7.102C48.351 7.74763 48.351 7.74763 47.7053 8.03458C46.1271 8.60848 45.1945 9.68454 45.0511 11.3345C44.9793 12.841 45.7684 13.8453 46.988 14.6344C47.7771 15.0648 48.5662 15.3518 49.427 15.7105C49.714 15.854 50.0727 15.9974 50.2879 16.2126C51.077 16.8583 50.9335 17.9343 50.0009 18.293C49.4988 18.5082 48.9966 18.58 48.4227 18.5082C47.5619 18.4365 46.7728 18.2213 46.0554 17.7909C45.625 17.5756 45.4815 17.6474 45.338 18.0778C45.1945 18.5082 45.1228 18.8669 44.9793 19.2973C44.8358 19.8712 44.9076 20.0147 45.4097 20.2299C46.0554 20.5886 46.7728 20.7321 47.5619 20.8038C48.1358 20.8756 48.1358 20.9473 48.1358 21.5212C48.1358 21.8082 48.1358 22.0951 48.1358 22.3103C48.1358 22.669 48.2792 22.8842 48.6379 22.8842C49.0683 22.8842 49.427 22.8842 49.8575 22.8842C50.2161 22.8842 50.3596 22.669 50.3596 22.382C50.3596 22.0234 50.3596 21.6647 50.3596 21.306C50.3596 20.9473 50.5031 20.7321 50.8618 20.6604C51.7226 20.4451 52.3683 20.0147 52.9422 19.2973C54.4486 17.4322 53.8747 14.7062 51.7226 13.5584Z"
        fill="#E2E559"
      />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg viewBox="0 0 55 53" className="block h-[3.3125rem] w-auto self-start" aria-hidden>
      <path
        d="M27.3949 40.3385C25.7902 40.3385 24.2511 39.701 23.1164 38.5662C21.9816 37.4315 21.3442 35.8925 21.3442 34.2877C21.3442 32.6829 21.9816 31.1439 23.1164 30.0091C24.2511 28.8744 25.7902 28.2369 27.3949 28.2369C28.9997 28.2369 30.5387 28.8744 31.6735 30.0091C32.8082 31.1439 33.4457 32.6829 33.4457 34.2877C33.4457 35.8925 32.8082 37.4315 31.6735 38.5662C30.5387 39.701 28.9997 40.3385 27.3949 40.3385ZM53.6226 37.8891C46.9359 47.1367 37.3771 52.44 27.3949 52.44C17.4128 52.44 7.85397 47.1367 1.16706 37.8901C0.408439 36.8425 0 35.5811 0 34.2877C0 32.9943 0.408439 31.7339 1.16706 30.6863C7.85397 21.4387 17.4128 16.1354 27.3949 16.1354C37.3771 16.1354 46.9359 21.4387 53.6228 30.6853C54.3814 31.733 54.7898 32.9936 54.7898 34.2872C54.7898 35.5808 54.3812 36.8413 53.6226 37.8891ZM27.3949 24.2031C24.7203 24.2031 22.1553 25.2656 20.264 27.1568C18.3728 29.048 17.3103 31.6131 17.3103 34.2877C17.3103 36.9623 18.3728 39.5274 20.264 41.4186C22.1553 43.3098 24.7203 44.3723 27.3949 44.3723C30.0695 44.3723 32.6346 43.3098 34.5258 41.4186C36.4171 39.5274 37.4795 36.9623 37.4795 34.2877C37.4795 31.6131 36.4171 29.048 34.5258 27.1568C32.6346 25.2656 30.0695 24.2031 27.3949 24.2031ZM25.378 2.01692V12.1015C25.378 12.6365 25.5905 13.1495 25.9687 13.5277C26.347 13.906 26.86 14.1185 27.3949 14.1185C27.9298 14.1185 28.4429 13.906 28.8211 13.5277C29.1994 13.1495 29.4118 12.6365 29.4118 12.1015V2.01692C29.4118 1.482 29.1994 0.968989 28.8211 0.590743C28.4429 0.212497 27.9298 0 27.3949 0C26.86 0 26.347 0.212497 25.9687 0.590743C25.5905 0.968989 25.378 1.482 25.378 2.01692ZM49.262 6.94205L42.778 14.6669C42.4457 15.0777 42.2879 15.6026 42.3386 16.1286C42.3892 16.6547 42.6443 17.1398 43.049 17.4796C43.4536 17.8195 43.9755 17.987 44.5024 17.9461C45.0292 17.9052 45.519 17.6591 45.8663 17.2608L52.3503 9.53601C52.6826 9.12513 52.8404 8.60024 52.7897 8.07423C52.7391 7.54822 52.484 7.0631 52.0793 6.72323C51.6747 6.38335 51.1528 6.21586 50.6259 6.25678C50.0991 6.2977 49.6093 6.54376 49.262 6.94205ZM2.43954 9.53601L8.92354 17.2608C9.27112 17.6581 9.7606 17.9033 10.2869 17.9438C10.8132 17.9842 11.3344 17.8167 11.7387 17.4772C12.1429 17.1377 12.3979 16.6533 12.449 16.1279C12.5 15.6025 12.3431 15.0781 12.0119 14.6671L5.52785 6.94225C5.18027 6.54497 4.69079 6.29978 4.16447 6.25932C3.63816 6.21886 3.11696 6.38635 2.71274 6.72584C2.30852 7.06533 2.0535 7.54976 2.00242 8.07515C1.95135 8.60054 2.10828 9.12502 2.43954 9.53601Z"
        fill="#0160B4"
      />
    </svg>
  );
}

function BrandingIcon() {
  return (
    <svg viewBox="0 0 53 53" className="block h-[3.3125rem] w-auto self-start" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33.525 0C30.9748 0.000223963 28.5249 0.993498 26.6947 2.76928L26.6979 2.766L1.98886 26.7227C1.36577 27.3263 0.869039 28.0479 0.527616 28.8454C0.186199 29.6429 0.00690889 30.5003 0.000195473 31.3678C-0.00651248 32.2353 0.159488 33.0954 0.488532 33.8981C0.817571 34.7008 1.30307 35.43 1.91675 36.0432L16.3968 50.522C17.0098 51.1361 17.739 51.6219 18.5417 51.9511C19.3445 52.2804 20.2048 52.4465 21.0725 52.4398C21.9402 52.4331 22.7978 52.2537 23.5954 51.9121C24.3929 51.5704 25.1145 51.0734 25.718 50.4499L49.6765 25.7428C51.4496 23.9141 52.4427 21.4659 52.4427 18.9163V6.5414C52.4427 2.92658 49.5159 0 45.9008 0H33.525ZM36.3735 9.57566C36.6376 8.97402 37.0198 8.43148 37.4973 7.98011C38.4276 7.10065 39.6642 6.61875 40.9443 6.63689C42.2243 6.65497 43.4469 7.17166 44.3519 8.07702C45.2569 8.98243 45.7731 10.2051 45.7905 11.4851C45.8081 12.765 45.3255 14.0014 44.4456 14.9311C43.9939 15.4084 43.4512 15.7902 42.8494 16.0542C42.2476 16.3181 41.599 16.4587 40.942 16.4676C40.2849 16.4767 39.6327 16.3538 39.024 16.1065C38.4152 15.8591 37.8622 15.4922 37.3976 15.0275C36.9331 14.5628 36.5664 14.0096 36.3193 13.4008C36.0723 12.7919 35.9497 12.1398 35.959 11.4827C35.9683 10.8258 36.1092 10.1772 36.3735 9.57566ZM23.7188 15.7406L14.1058 25.3528C13.4708 25.9877 13.1141 26.8489 13.1141 27.7468C13.1141 28.6447 13.4708 29.5059 14.1058 30.1408C14.7408 30.7757 15.602 31.1324 16.5001 31.1324C17.398 31.1324 18.2593 30.7757 18.8943 30.1408L28.5072 20.5286C29.1421 19.8937 29.4989 19.0326 29.4989 18.1346C29.4989 17.2367 29.1421 16.3755 28.5072 15.7406C27.8722 15.1057 27.0109 14.749 26.113 14.749C25.2149 14.749 24.3537 15.1057 23.7188 15.7406ZM31.9125 23.9337L22.2996 33.5459C21.6646 34.1808 21.3079 35.042 21.3079 35.9399C21.3079 36.8379 21.6646 37.699 22.2996 38.3339C22.9346 38.9689 23.7958 39.3256 24.6938 39.3256C25.5918 39.3256 26.453 38.9689 27.088 38.3339L36.7009 28.7218C37.0153 28.4074 37.2647 28.0342 37.4349 27.6234C37.605 27.2126 37.6927 26.7724 37.6927 26.3277C37.6927 25.8831 37.605 25.4429 37.4349 25.0321C37.2647 24.6214 37.0153 24.2481 36.7009 23.9337C36.3865 23.6193 36.0133 23.37 35.6024 23.1998C35.1916 23.0296 34.7514 22.9421 34.3067 22.9421C33.8621 22.9421 33.4217 23.0296 33.011 23.1998C32.6002 23.37 32.2269 23.6193 31.9125 23.9337Z"
        fill="#E2E559"
      />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 58 53" className="block h-[3.3125rem] w-auto self-start" aria-hidden>
      <path d="M6.19224 46.0472H6.21332C7.7996 46.0393 9.08806 44.7508 9.08806 43.1672C9.08806 41.5809 7.79164 40.2872 6.20805 40.2872C4.61651 40.2872 3.32805 41.5836 3.32805 43.1672C3.32542 44.7535 4.61385 46.0472 6.19224 46.0472Z" fill="#0160B4" />
      <path d="M6.21854 47.5049H6.19219C3.10929 47.5128 0.527028 49.6234 0 52.4297H12.4002C12.2526 51.6603 11.947 50.9251 11.5043 50.2638C10.3476 48.5379 8.36342 47.5049 6.21854 47.5049Z" fill="#0160B4" />
      <path d="M15.6886 34.878C15.1432 34.878 14.6293 34.986 14.1445 35.1678C14.1445 35.1757 14.1445 35.1757 14.1366 35.1757C12.524 35.7976 11.3698 37.3601 11.3698 39.1967C11.3698 41.5655 13.2854 43.4943 15.6464 43.5127H15.7333C18.0864 43.4864 19.9967 41.5629 19.9967 39.1967C19.9993 36.8147 18.0706 34.878 15.6886 34.878Z" fill="#0160B4" />
      <path d="M18.4158 45.3598C17.5516 45.0963 16.6556 44.962 15.7386 44.9541C15.7228 44.9699 15.7097 44.9699 15.6886 44.9699H15.6543C13.5226 44.9778 11.5253 45.6787 9.90747 46.954C11.0274 47.5416 11.9917 48.3901 12.7137 49.4572C13.3198 50.3531 13.7045 51.3728 13.8599 52.44H24.7C24.5235 51.2121 24.0597 50.0185 23.343 48.9592C22.1863 47.2359 20.4395 45.9606 18.4158 45.3598Z" fill="#0160B4" />
      <path d="M28.526 27.2285C25.0241 27.2285 22.1783 30.0743 22.1783 33.5762C22.1783 37.0649 25.0188 39.9107 28.5049 39.9159H28.5444C32.0331 39.908 34.871 37.0622 34.871 33.5762C34.8736 30.0743 32.0279 27.2285 28.526 27.2285Z" fill="#0160B4" />
      <path d="M37.0449 44.4033C34.6972 42.4535 31.7171 41.3757 28.5523 41.3757L28.526 41.3731H28.5128C25.335 41.381 22.368 42.4455 19.9993 44.4007C21.8464 45.1965 23.4406 46.4849 24.5446 48.1371C25.4221 49.4388 25.9754 50.9091 26.1572 52.4347H30.8922C31.3244 48.9091 33.6853 45.8524 37.0449 44.4033Z" fill="#0160B4" />
      <path d="M37.053 39.1937C37.053 41.5547 38.9607 43.4835 41.3164 43.5098H41.4034C43.7643 43.4887 45.6799 41.5678 45.6799 39.1937C45.6799 36.8197 43.7432 34.8777 41.3638 34.8777C38.9819 34.8777 37.053 36.8144 37.053 39.1937Z" fill="#0160B4" />
      <path d="M47.145 46.9511C45.5324 45.6837 43.5035 44.967 41.4034 44.9617H41.3165C40.3863 44.9617 39.4825 45.0961 38.6262 45.3596C35.2665 46.3635 32.8239 49.1513 32.347 52.4289H43.1743C43.5274 50.0548 45.0449 48.0525 47.145 46.9511Z" fill="#0160B4" />
      <path d="M5.48328 24.3961H13.8626C14.2605 24.3961 14.5898 24.7255 14.5898 25.1233V33.2389C14.5898 33.3943 14.7242 33.5076 14.8797 33.4892C15.1432 33.4497 15.4119 33.4365 15.6833 33.4365C18.8664 33.4365 21.4566 36.0266 21.4566 39.2045C21.4566 40.298 21.1456 41.3151 20.6213 42.1873C21.8966 41.3915 23.2852 40.7907 24.7634 40.4192C21.9967 38.8936 20.2576 35.7368 20.8373 32.2557C21.4038 28.883 24.2232 26.2243 27.6226 25.8343C32.3235 25.3021 36.3311 28.9858 36.3311 33.5836C36.3311 36.519 34.6974 39.0801 32.2917 40.4108C33.762 40.7876 35.1586 41.3752 36.4339 42.1788C35.9069 41.3093 35.5986 40.2895 35.5986 39.196C35.5986 36.0183 38.1887 33.4281 41.3718 33.4281C41.6485 33.4281 41.912 33.4491 42.1754 33.4808C42.3309 33.5018 42.4653 33.3859 42.4653 33.2304L42.4627 25.1176C42.4627 24.7197 42.7868 24.3956 43.1846 24.3956H51.5639C51.9961 24.3956 52.2121 23.8765 51.9091 23.5735L28.8637 0.14624C28.674 -0.0487466 28.3657 -0.0487466 28.1681 0.14624L5.13818 23.5714C4.83515 23.8771 5.05114 24.3961 5.48328 24.3961Z" fill="#0160B4" />
      <path d="M47.9666 43.1675C47.9666 44.7538 49.2552 46.0475 50.8414 46.0475H50.8625C52.4487 46.0396 53.7293 44.7511 53.7293 43.1675C53.7293 41.5813 52.4408 40.2875 50.8493 40.2875C49.2604 40.2875 47.9666 41.584 47.9666 43.1675Z" fill="#0160B4" />
      <path d="M56.1483 50.2632C54.9889 48.5373 53.0047 47.5044 50.8678 47.5044H50.8415C50.1195 47.5044 49.4238 47.6256 48.7783 47.8337C48.7651 47.8417 48.7519 47.8417 48.7388 47.8469C46.6466 48.5557 45.063 50.2895 44.6572 52.4265H57.0548C56.9046 51.6598 56.5936 50.9245 56.1483 50.2632Z" fill="#0160B4" />
    </svg>
  );
}

function ValuesIcon() {
  return (
    <svg viewBox="0 0 61 61" className="block h-[3.8125rem] w-auto self-start" aria-hidden>
      <path
        d="M58.1577 41.499C51.6585 44.7499 48.5582 47.0071 46.5238 48.4909C45.1253 49.5106 44.2329 50.1618 43.0913 50.5095C38.0139 52.0454 28.788 48.6622 23.7262 49.8297C22.2992 50.1592 20.9916 50.8961 19.1339 52.2997L8.92469 39.4882C19.3651 30.6412 21.0123 30.3921 26.8684 31.4714C29.6108 31.9774 33.1834 33.0592 39.122 33.0696C40.3155 33.0748 40.5672 33.9024 40.2454 34.8858C39.9315 35.8483 39.1324 36.8887 38.3566 37.6619C37.7365 38.2768 36.9037 38.5025 36.0579 38.2923L30.5135 36.9043C29.7948 36.7201 29.0606 37.1612 28.8816 37.8825C28.7025 38.6037 29.141 39.3354 29.8597 39.5144L37.3292 41.3876C42.0045 42.5551 45.7743 40.3679 49.7462 38.2249C51.5467 37.2546 53.7599 36.0611 56.5853 34.6419C62.0182 31.9125 61.2113 39.9684 58.1524 41.4964L58.1577 41.499ZM5.25113 39.1977C4.99168 38.8734 4.51428 38.8267 4.1952 39.0784L0.280143 42.197C-0.0441668 42.4564 -0.0908658 42.9338 0.160795 43.2529L13.7846 60.3531C14.1634 60.7708 14.4955 60.8279 14.9573 60.4828L18.7427 57.4654C19.1681 57.1073 19.2045 56.7389 18.8724 56.2927L5.25113 39.1977ZM38.1776 26.5549L43.2369 10.5626H33.1213L38.1805 26.5549H38.1776ZM55.2492 7.86133L47.3879 0H43.0603L46.0051 7.86133H55.2492ZM46.0622 10.5596L41.815 23.9941L55.2496 10.5596H46.0622ZM30.2957 10.5596H21.1086L34.5432 23.9941L30.2957 10.5596ZM43.1384 7.86133L40.1937 0H36.1644L33.2197 7.86133H43.1384ZM33.2978 0H28.9702L21.1089 7.86133H30.3531L33.2978 0Z"
        fill="#E2E559"
      />
    </svg>
  );
}

function AccessIcon() {
  return (
    <svg viewBox="0 0 59 36" className="block h-[2.25rem] w-auto self-start" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M29.2547 0C35.7079 0 38.9592 7.83869 34.3933 12.4046C29.8268 16.9711 21.9881 13.7192 21.9881 7.26657C21.9881 3.25393 25.2414 0 29.2547 0ZM18.4228 19.9455C15.934 18.103 12.9155 17.5959 9.85526 17.8709C4.10611 18.3878 -0.247198 23.3899 0.0109062 29.2171C4.09766 32.1167 9.18302 33.3611 14.1936 32.6557C13.7281 32.2695 13.7873 31.3255 13.7873 30.6721C13.7873 26.5197 15.5453 22.6767 18.4228 19.9455ZM8.1155 3.8176C12.1054 -0.172286 18.9539 2.66946 18.9539 8.30744C18.9539 13.9448 12.1054 16.7872 8.1155 12.7966C5.63588 10.317 5.63588 6.29722 8.1155 3.8176ZM44.3144 32.655C49.3172 33.3637 54.4201 32.1109 58.4991 29.2165C58.7728 23.022 53.8662 17.83 47.6685 17.83C44.711 17.83 42.5838 18.0959 40.0866 19.9449C43.3191 23.0135 45.0666 27.3772 44.6583 31.9971C44.6356 32.2643 44.5056 32.4964 44.3144 32.655ZM45.8546 1.95821C51.4919 1.95821 54.3337 8.80674 50.3438 12.7966C46.3532 16.7865 39.5054 13.9448 39.5054 8.30744C39.5054 4.8006 42.3478 1.95821 45.8546 1.95821ZM15.7214 30.6715C15.7214 24.0726 20.8192 18.4593 27.4076 17.867L29.9328 17.8183C37.3138 17.8183 43.1494 24.0362 42.7697 31.3983C34.6989 37.1663 23.8091 37.1663 15.739 31.3983C15.7273 31.1656 15.7214 30.9231 15.7214 30.6715Z"
        fill="#0160B4"
      />
    </svg>
  );
}

const benefits: { title: string; body: string; tone: "dark" | "light"; icon: ReactNode }[] = [
  {
    title: "Sales activation/ product sampling:",
    body: "All our sponsors will be provided the platform to carry out sales activation or sampling of products to participants and guest during our major events",
    tone: "dark",
    icon: <SalesIcon />,
  },
  {
    title: "Media exposure",
    body: "Inclusion of sponsors/partners logo on our promotional materials at our events, website and relevant social media post.",
    tone: "light",
    icon: <MediaIcon />,
  },
  {
    title: "Branding",
    body: "We would design co-branded banners, dummy cheques and media walls with our sponsor logo and hang at the tennis courts and our life skill training programmes.",
    tone: "dark",
    icon: <BrandingIcon />,
  },
  {
    title: "Team building opportunities",
    body: "Aligned with your organization's corporate social responsibility goals, we offer your staff the chance to contribute their skills and passions through programs that allow them to have fun, give back, and benefit the community.",
    tone: "light",
    icon: <TeamIcon />,
  },
  {
    title: "Crystallization of values",
    body: "We will promote the core values of our sponsors to all our beneficiaries and also help customers understand and embrace these values.",
    tone: "dark",
    icon: <ValuesIcon />,
  },
  {
    title: "Direct access to established communities",
    body: "Our sponsors will access all our events and programs across various locations, including schools, government sports facilities, private centers, and recreational parks, which already have established communities of sports enthusiasts and your target audience.",
    tone: "light",
    icon: <AccessIcon />,
  },
];

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
      <path
        d={direction === "left" ? "M14.5 6.5 8.5 12l6 5.5" : "M9.5 6.5 15.5 12l-6 5.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BecomeASponsor() {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  useEffect(() => {
    sync();
  }, []);

  const move = (direction: number) => {
    const el = scroller.current;
    const card = el?.querySelector("article");
    if (!el || !card) return;
    const gap = 16;
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  return (
    <>
      <section aria-labelledby="sponsor-heading" className="bg-white pt-14 pb-10 sm:pt-20">
        <Container>
          <h1
            id="sponsor-heading"
            className="headline text-center text-[clamp(3rem,6.5vw,5.75rem)] leading-[0.82] text-blue-bright"
          >
            Become a sponsor
          </h1>
          <p className="mx-auto mt-6 max-w-[52rem] text-center text-[1.02rem] leading-relaxed text-gray">
            Our partners and sponsors offer vital resources that enable us to make a lasting impact through tennis.
            Supporting us aligns perfectly with organizations focused on Corporate Social Responsibility (CSR) and
            community giving. By backing our mission, your organization&apos;s values will resonate with all
            beneficiaries.
          </p>
        </Container>
      </section>

      <section aria-labelledby="formats-heading" className="bg-white pb-16">
        <Container className="rounded-[1.75rem] bg-lime-tint px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-12">
            <div>
              <h2 id="formats-heading" className="headline max-w-[28rem] text-[clamp(1.6rem,2.4vw,2.15rem)] leading-[0.95] text-blue">
                We would be glad to have your support in any of the following formats:
              </h2>
              <ol className="mt-8 space-y-4">
                {formats.map((item, index) => (
                  <li key={item} className="flex gap-4">
                    <span className="font-display text-[2rem] leading-none font-extrabold text-blue-bright">
                      {index + 1}
                    </span>
                    <span className="pt-1 text-[1.02rem] leading-snug font-medium text-blue">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
            <img
              src="/we-would-be-glad.jpg"
              alt="Sponsors presenting a scholarship cheque to a junior tennis winner"
              className="aspect-[766/722] w-full rounded-[1.25rem] object-cover"
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby="benefits-heading" className="bg-white pb-16">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-[46rem]">
              <h2 id="benefits-heading" className="headline text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.85]">
                <span className="text-blue">Benefits of </span>
                <span className="text-blue-bright">sponsorship</span>
              </h2>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-gray">
                Our promise to all our sponsors is to ensure they derive maximum benefits from partnering with us. Our
                sponsors or partners would benefit from this partnership in the following way:
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous benefits"
                disabled={atStart}
                className="grid h-12 w-12 place-items-center rounded-full bg-blue text-white transition-opacity disabled:bg-[#e7eef6] disabled:text-blue disabled:opacity-80"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next benefits"
                disabled={atEnd}
                className="grid h-12 w-12 place-items-center rounded-full bg-blue text-white transition-opacity disabled:bg-[#e7eef6] disabled:text-blue disabled:opacity-80"
              >
                <Chevron direction="right" />
              </button>
            </div>
          </div>

          <div
            ref={scroller}
            onScroll={sync}
            className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {benefits.map((benefit) => {
              const dark = benefit.tone === "dark";
              return (
                <article
                  key={benefit.title}
                  className={`flex min-h-[22rem] w-[85%] shrink-0 snap-start flex-col rounded-[1.15rem] p-6 sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] ${
                    dark ? "bg-blue text-white" : "bg-blue-tint text-blue"
                  }`}
                >
                  <span className="mb-8 flex h-[3.8125rem] items-end">{benefit.icon}</span>
                  <h3
                    className={`headline text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[0.8] [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] ${
                      dark ? "text-white" : "text-blue"
                    }`}
                  >
                    {benefit.title}
                  </h3>
                  <p className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-white/90" : "text-blue"}`}>
                    {benefit.body}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <InquiryForm
        type="sponsorship"
        heading="Sponsor a programme"
        intro="Tell us how you'd like to support kits, prizes, scholarships, or a full programme. The message lands in the admin inbox."
      />

      <section className="bg-white pb-20">
        <Container>
          <div className="mx-auto flex w-full max-w-[60rem] flex-col items-center gap-6 rounded-[1.75rem] bg-lime px-6 py-8 sm:flex-row sm:items-center sm:justify-start sm:gap-12 sm:px-10 sm:py-6 lg:gap-16 lg:px-12">
            <p className="text-[1.05rem] leading-relaxed text-blue sm:shrink-0">
              Interested in sponsoring any of our programmes?
              <br />
              Please contact us now on
              <a href="mailto:sponsorships@tennistafoundation.org" className="mt-3 block headline text-[1.35rem] leading-none text-blue">
                sponsorships@tennistafoundation.org
              </a>
            </p>
            <img
              src="/sponsorship-tennista-mail.jpg"
              alt="A child smiling as she holds a tennis ball"
              className="aspect-[592/335] w-full max-w-[18.5rem] rounded-[1rem] object-cover sm:w-[18.5rem]"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
