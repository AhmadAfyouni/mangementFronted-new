import { XIcon } from "@/assets";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface StarRatingProps {
  max?: number;
  defaultValue?: number;
  size?: number;
  onChange?: (rating: number) => void;
  onSubmit: (rating: number) => void;
  title?: string;
  isRatingOpen: boolean;
  setIsRatingOpen: Dispatch<SetStateAction<boolean>>;
}

const StarIcon = ({ filled, size }: { filled: boolean; size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#ffd500" : "none"}
    stroke={filled ? "#ffd500" : "#d1d5db"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-all duration-200"
  >
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </svg>
);

const StarRating = ({
  max = 5,
  defaultValue = 0,
  size = 24,
  onChange,
  title = "Rate your experience",
  isRatingOpen,
  setIsRatingOpen,
  onSubmit,
}: StarRatingProps) => {
  const [rating, setRating] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const { isLightMode } = useCustomTheme();
  const { t } = useLanguage();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsRatingOpen(false);
      }
    };

    if (isRatingOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRatingOpen, setIsRatingOpen]);

  const handleClick = (value: number) => {
    setRating(value);
    onChange?.(value);
  };

  const handleSubmit = () => {
    setIsRatingOpen(false);
    onSubmit(rating);
  };

  const RatingStars = () => (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, index) => {
        const value = index + 1;
        const filled = value <= (hover || rating);

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform duration-200 hover:scale-110 cursor-pointer"
            aria-label={`Rate ${value} out of ${max} stars`}
          >
            <StarIcon filled={filled} size={size} />
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {isRatingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-twhite">
          <div
            ref={modalRef}
            className="bg-secondary  rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium ">{title}</h3>
              <button
                onClick={() => setIsRatingOpen(false)}
                className=" focus:outline-none"
              >
                <Image src={XIcon} alt="x icon" height={20} width={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <RatingStars />
                <span className="text-sm ">
                  {rating > 0
                    ? `${t("Your rating:")} ${rating} ${t("of")} ${max}`
                    : t("Select your rating")}
                </span>
              </div>
            </div>

            {/* Footer */}
            {rating > 0 && (
              <div className="flex justify-end gap-3 px-6 py-4 bg-secondary rounded-b-lg">
                <button
                  onClick={() => setIsRatingOpen(false)}
                  className={`px-4 py-2 text-sm font-medium  ${
                    isLightMode ? "hover:text-white" : ""
                  } border border-gray-300 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-4 py-2 text-sm font-medium ${
                    isLightMode
                      ? "text-white  bg-darkest hover:bg-tblack"
                      : "bg-dark"
                  }  border border-transparent rounded-md hover:bg-tdark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {t("Submit")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StarRating;
