"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Plus, Trash2, FileImage } from "lucide-react";
import { Button } from "@/components/Button";
import { vocabularyService } from "@/services/vocabulary.service";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

export default function AddWordPage() {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [meaning, setMeaning] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [wordPosList, setWordPosList] = useState<
    {
      id: string;
      pos_tag: string;
      level: string;
      definition?: string;
      examples: { en: string; vi: string }[];
      categories: string[];
      imageUrl?: string | null;
      imageFile?: File | null;
    }[]
  >([
    {
      id: uuidv4(),
      pos_tag: "",
      level: "",
      definition: "",
      examples: [],
      categories: [],
    },
  ]);
  const [posOptions, setPosOptions] = useState<
    {
      pos_tag_id: string;
      pos_tag: string;
    }[]
  >([]);
  const [levelOptions, setLevelOptions] = useState<
    {
      level_id: string;
      level_name: string;
      level_title: string;
    }[]
  >([]);
  const [categoriesOptions, setCategoriesOptions] = useState<
    { category_id: string; category_name: string }[]
  >([]);
  const onSelectFile = (file?: File) => {
    if (!file) return;
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) onSelectFile(f);
  };
  const handleAddWordPos = () =>
    setWordPosList([
      ...wordPosList,
      {
        id: uuidv4(),
        pos_tag: "",
        level: "",
        definition: "",
        examples: [],
        categories: [],
      },
    ]);
  const handleRemoveWordPos = (index: number) => {
    if (wordPosList.length === 1)
      return alert("At least one part of speech is required.");
    setWordPosList(wordPosList.filter((_, i) => i !== index));
  };
  const handlePosChange = (index: number, field: string, value: string) => {
    const updated = [...wordPosList];
    if (field == "categories") {
      const oldCategory = [...(updated[index] as any)[field]];
      (updated[index] as any)[field] = [...oldCategory, value];
    } else {
      (updated[index] as any)[field] = value;
    }
    setWordPosList(updated);
  };
  const handleExampleChange = (
    posIndex: number,
    exIndex: number,
    field: string,
    value: string
  ) => {
    const updated = [...wordPosList];
    updated[posIndex].examples[exIndex][field] = value;
    setWordPosList(updated);
  };
  const handleImageChange = (index: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setWordPosList((prev) =>
        prev.map((pos, i) =>
          i === index
            ? { ...pos, imageUrl: reader.result as string, imageFile: file }
            : pos
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const addExample = (posIndex: number) => {
    const updated = [...wordPosList];
    updated[posIndex].examples.push({ en: "", vi: "" });
    setWordPosList(updated);
  };
  const removeExample = (posIndex: number, exIndex: number) => {
    const updated = [...wordPosList];
    updated[posIndex].examples.splice(exIndex, 1);
    setWordPosList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1️⃣ Validate required fields
    if (!word.trim() || !meaning.trim()) {
      toast.error("Please provide at least word and meaning");
      return;
    }

    if (!audioFile) {
      toast.error("Please upload an audio file for this word 🎧");
      return;
    }

    if (wordPosList.some((p) => !p.pos_tag || !p.level)) {
      toast.error("Each part of speech must have POS, definition, and level.");
      return;
    }

    // 2️⃣ Validate examples contain the main word
    const hasInvalidExample = wordPosList.some((pos) =>
      pos.examples?.some(
        (ex) => !ex.en.toLowerCase().includes(word.trim().toLowerCase())
      )
    );
    if (hasInvalidExample) {
      toast.error("Each English example must contain the word you're adding!");
      return;
    }

    const hasInvalidExampleVi = wordPosList.some((pos) =>
      pos.examples?.some((ex) => !ex.vi.trim())
    );

    if (hasInvalidExampleVi) {
      toast.error("Each English example must have a Vietnamese translation!");
      return;
    }

    const isWordExist = await vocabularyService.isWordExist(word);

    if (isWordExist.data) {
      toast.error("Word already exists");
      return;
    }
    // 3️⃣ If valid, proceed
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      const formData = new FormData();
      formData.append("word", word);
      formData.append("phonetic", phonetic);
      formData.append("meaning_vi", meaning);
      formData.append("audio", audioFile); // File object

      const wordPosWithoutFile = wordPosList.map(
        ({ imageFile, ...rest }) => rest
      );
      formData.append("word_pos", JSON.stringify(wordPosWithoutFile));

      wordPosList.forEach((pos, idx) => {
        if (pos.imageFile) {
          formData.append(`word_pos_images`, pos.imageFile);
          formData.append("word_pos_image_metadata_index", idx.toString());
        }
      });

      vocabularyService
        .addWord(formData)
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));

      toast.success("New word added successfully! 🎉", {
        position: "top-right",
      });
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while adding the word 😢", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    }
  };

  const handleRemoveCategory = (index: number, categoryId: string) => {
    const updated = [...wordPosList];
    const oldCategories = [...updated[index].categories];
    updated[index].categories = oldCategories.filter((c) => c !== categoryId);
    setWordPosList(updated);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posRes, levelRes, categoryRes] = await Promise.all([
          vocabularyService.getPosTags(),
          vocabularyService.getLevels(),
          vocabularyService.getCategories(),
        ]);
        setPosOptions(posRes.data);
        setLevelOptions(levelRes.data);
        setCategoriesOptions(categoryRes.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-10 w-full">
      {" "}
      <Button
        variant="primary"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 border-gray-300 text-gray-600 hover:text-gray-800"
      >
        {" "}
        <ArrowLeft size={16} /> Back{" "}
      </Button>{" "}
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Add New Word
      </h1>{" "}
      <form onSubmit={handleSubmit} className="space-y-6">
        {" "}
        {/* Word Info */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {" "}
          <div className="relative">
            {" "}
            <input
              type="text"
              placeholder="Word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />{" "}
          </div>{" "}
          <div className="relative">
            {" "}
            <input
              type="text"
              placeholder="Phonetic"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />{" "}
          </div>{" "}
          <div className="relative">
            {" "}
            <input
              type="text"
              placeholder="Meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />{" "}
          </div>{" "}
        </div>{" "}
        {/* Audio */}{" "}
        <div className="flex items-center gap-3">
          {" "}
          <label className="inline-flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-800">
            {" "}
            <UploadCloud size={18} /> <span>Choose audio file</span>{" "}
            <input
              ref={inputFileRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />{" "}
          </label>{" "}
          {audioFile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {" "}
              <span className="truncate max-w-[200px]">
                {audioFile.name}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setAudioFile(null);
                  if (audioPreview) {
                    URL.revokeObjectURL(audioPreview);
                    setAudioPreview(null);
                  }
                  if (inputFileRef.current) inputFileRef.current.value = "";
                }}
                className="underline text-gray-500 hover:text-gray-700"
              >
                {" "}
                Remove{" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {audioPreview && (
          <audio
            controls
            src={audioPreview}
            className="w-full rounded-lg border border-gray-200 mt-2"
          />
        )}{" "}
        {/* Word POS Section */}{" "}
        <div className="border-t pt-6 mt-6 space-y-4">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <h2 className="text-lg font-semibold text-gray-800">
              Part of Speech
            </h2>{" "}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddWordPos}
              className="flex items-center gap-2"
            >
              {" "}
              <Plus size={16} /> Add POS{" "}
            </Button>{" "}
          </div>{" "}
          {wordPosList.map((pos, i) => (
            <div
              key={pos.id}
              className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                {" "}
                <h3 className="font-medium text-gray-700">
                  Part of Speech #{i + 1}
                </h3>{" "}
                {wordPosList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveWordPos(i)}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    {" "}
                    <Trash2 size={16} />{" "}
                  </button>
                )}{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  {/* Definition input */}
                  <input
                    type="text"
                    placeholder="Definition"
                    value={pos.definition}
                    onChange={(e) =>
                      handlePosChange(i, "definition", e.target.value)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {/* POS select */}
                  <Select
                    value={pos.pos_tag}
                    onValueChange={(value) =>
                      handlePosChange(i, "pos_tag", value)
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Select POS" />
                    </SelectTrigger>
                    <SelectContent>
                      {posOptions
                        .filter(
                          (opt) =>
                            !wordPosList.some(
                              (item, j) =>
                                j !== i && item.pos_tag === opt.pos_tag_id
                            )
                        )
                        .map((opt) => (
                          <SelectItem
                            key={opt.pos_tag_id}
                            value={opt.pos_tag_id}
                          >
                            {opt.pos_tag}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Level select */}
                  <Select
                    value={pos.level}
                    onValueChange={(value) =>
                      handlePosChange(i, "level", value)
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((opt) => (
                        <SelectItem key={opt.level_id} value={opt.level_id}>
                          {opt.level_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Category Section */}
                  <div className="flex flex-col gap-3">
                    <Select
                      onValueChange={(value) =>
                        handlePosChange(i, "categories", value)
                      }
                    >
                      <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <SelectValue placeholder="Select category">
                          Select category
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesOptions
                          .filter(
                            (cat) => !pos.categories.includes(cat.category_id)
                          )
                          .map((cat) => (
                            <SelectItem
                              key={cat.category_id}
                              value={cat.category_id}
                            >
                              {cat.category_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {/* Selected chips */}
                    {pos.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pos.categories.map((id) => {
                          const cat = categoriesOptions.find(
                            (c) => c.category_id === id
                          );
                          if (!cat) return null;
                          return (
                            <div
                              key={id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-400 
                  text-indigo-600 text-sm"
                            >
                              <span>{cat.category_name}</span>
                              <button
                                onClick={() =>
                                  handleRemoveCategory(i, cat.category_id)
                                }
                                className="text-indigo-400 hover:text-red-500 transition cursor-pointer"
                                type="button"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div
                    className="relative w-80 h-80 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400"
                    onClick={() =>
                      document.getElementById(`image-input-${i}`)?.click()
                    }
                  >
                    {pos.imageUrl ? (
                      <img
                        src={pos.imageUrl}
                        alt={`WordPos ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        {/* FontAwesome icon */}
                        <FileImage
                          size={60}
                          strokeWidth={1}
                          className="fas fa-image text-gray-400 mb-2"
                        />
                        {/* Text */}
                        <span className="text-gray-500 text-base px-2">
                          Click to select image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hidden input */}
                  <input
                    id={`image-input-${i}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(i, e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </div>
              </div>
              {/* Word Examples */}{" "}
              <div className="space-y-2">
                {" "}
                <label className="block text-sm font-medium text-gray-700">
                  {" "}
                  Examples (English - Vietnamese){" "}
                </label>{" "}
                {pos.examples.map((ex, j) => (
                  <div
                    key={j}
                    className="flex flex-col md:flex-row gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Example in English"
                      value={ex.en}
                      onChange={(e) =>
                        handleExampleChange(i, j, "en", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Vietnamese translation"
                      value={ex.vi}
                      onChange={(e) =>
                        handleExampleChange(i, j, "vi", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeExample(i, j)}
                      className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0"
                      title="Delete this example"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addExample(i)}
                  className="text-indigo-600 text-sm hover:text-indigo-800 mt-1 cursor-pointer"
                >
                  {" "}
                  + Add example{" "}
                </button>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
        {/* Buttons */}{" "}
        <div className="flex items-center gap-3 pt-3">
          {" "}
          <Button
            variant="filled"
            size="default"
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {" "}
            {loading ? "Saving..." : "Add Word"}{" "}
          </Button>{" "}
          <Button
            variant="outline"
            size="default"
            type="button"
            onClick={() => router.back()}
            disabled={loading}
          >
            {" "}
            Cancel{" "}
          </Button>{" "}
        </div>{" "}
      </form>{" "}
    </div>
  );
}
