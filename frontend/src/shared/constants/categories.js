export const BOOK_CATEGORIES = [
  { value: "business", label: "Kinh doanh" },
  { value: "fiction", label: "Viễn tưởng" },
  { value: "horror", label: "Kinh dị" },
  { value: "skills", label: "Kỹ năng" },
  { value: "comic", label: "Truyện tranh" },
  { value: "technology", label: "Công nghệ" },
  { value: "literary", label: "Văn học" },
];

export const getCategoryLabel = (value) => {
  const category = BOOK_CATEGORIES.find((c) => c.value === value);
  return category ? category.label : value;
};
