import { useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import type { UploadedMedia } from "../../utils/cloudinaryUpload";
import s from "./CreatePostModal.module.scss";

type Props = {
  onClose: () => void;
  onCreated: (post: {
    name: string;
    text: string;
    media: UploadedMedia[];
  }) => void;
};

export default function CreatePostModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (password !== "DEhub_Admin2026") {
      alert("Falsches Passwort");
      return;
    }

    if (!name.trim()) {
      alert("Bitte geben Sie einen Titel ein");
      return;
    }

    if (!text.trim()) {
      alert("Bitte geben Sie eine Beschreibung ein");
      return;
    }

    try {
      setLoading(true);

      const media = files.length > 0
        ? await Promise.all(files.map(uploadToCloudinary))
        : [];

      onCreated({
        name,
        text,
        media,
      });

      onClose();
    } catch (e) {
      console.error("❌ Upload error:", e);
      alert("Fehler beim Hochladen der Dateien");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.overlay}>
      <div className={s.modal}>
        <h2 className={s.title}>Beitrag erstellen</h2>

        {/* Image Upload Section */}
        <div className={s.imageSection}>
          <label className={s.imageUpload}>
            <span className={s.uploadIcon}>📷</span>
            <span>Foto hinzufügen ({files.length})</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {previews.length > 0 && (
            <div className={s.previews}>
              {previews.map((preview, index) => (
                <div key={index} className={s.previewItem}>
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    className={s.removeButton}
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Name Input */}
        <div className={s.inputGroup}>
          <label className={s.label}>Titel</label>
          <input
            type="text"
            placeholder="Titel eingeben..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={s.input}
          />
        </div>

        {/* Description Input */}
        <div className={s.inputGroup}>
          <label className={s.label}>Beschreibung</label>
          <textarea
            placeholder="Beschreibung schreiben..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={s.textarea}
          />
        </div>

        {/* Password (optional, for moderation) */}
        <div className={s.inputGroup}>
          <label className={s.label}>Passwort (zur Veröffentlichung)</label>
          <input
            type="password"
            placeholder="Passwort eingeben..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={s.input}
          />
        </div>

        {/* Actions */}
        <div className={s.actions}>
          <button className={s.cancelButton} onClick={onClose}>
            Abbrechen
          </button>
          <button
            className={s.submitButton}
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !text.trim()}
          >
            {loading ? "Wird geladen..." : "Veröffentlichen"}
          </button>
        </div>
      </div>
    </div>
  );
}
