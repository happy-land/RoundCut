import {
  ChangeEvent,
  FC,
  MouseEvent,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import block from "bem-cn";
import "./AdminCutList.scss";
import {
  useAddAdminCutMutation,
  useFetchAdminCutsQuery,
  useUpdateAdminCutMutation,
  useDeleteAdminCutMutation,
} from "../../services/adminCutApi";
import { TAdminCut } from "../../utils/types";

interface IAdminCutListProps {}

const cnStyles = block("admin-cut");

// Типы резки
type Profile = "bar" | "sheet";

const BAR_TYPES = [
  {
    code: "bandsaw",
    label: "Лентопильная (bandsaw)",
    profile: "bar" as Profile,
  },
  {
    code: "cutoff",
    label: "Отрезной станок (cutoff)",
    profile: "bar" as Profile,
  },
  { code: "gas", label: "Газовая резка (gas)", profile: "bar" as Profile },
];

const SHEET_TYPES = [
  {
    code: "guillotine",
    label: "Гильотина (guillotine)",
    profile: "sheet" as Profile,
  },
  {
    code: "plasma",
    label: "Плазменная резка (plasma)",
    profile: "sheet" as Profile,
  },
  { code: "thermal", label: "Термическая резка", profile: "sheet" as Profile },
  {
    code: "laser",
    label: "Лазерная резка (laser)",
    profile: "sheet" as Profile,
  },
];

const ALL_TYPES = [...BAR_TYPES, ...SHEET_TYPES];

const AdminCutList: FC<IAdminCutListProps> = () => {
  const [profile, setProfile] = useState<Profile>("bar");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [cutTitle, setCutTitle] = useState<string>("");

  // Редактирование
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [editingProfile, setEditingProfile] = useState<Profile>("bar");
  const [editingCode, setEditingCode] = useState<string>("");

  // API
  const { data: cuts = [] } = useFetchAdminCutsQuery(0);
  const [addCut, { isLoading: isAdding }] = useAddAdminCutMutation();
  const [updateCut, { isLoading: isUpdating }] = useUpdateAdminCutMutation();
  const [deleteCut, { isLoading: isDeleting }] = useDeleteAdminCutMutation();

  const options = useMemo(
    () => ALL_TYPES.filter((t) => t.profile === profile),
    [profile],
  );

  // Обработка инпута для добавления
  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setCutTitle(event.target.value);
  };

  // Автоподстановка названия при выборе карточки
  useEffect(() => {
    if (selectedCode) return;
    const found = ALL_TYPES.find((t) => t.code === selectedCode);
    if (found) {
      setCutTitle(found.label);
    }
  }, [selectedCode]);

  // Горячие клавиши
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const item = options[idx];
        if (item) setSelectedCode(item.code);
      }

      if ((e.key === "Enter" && e.ctrlKey) || e.metaKey) {
        const form = document.getElementById(
          "add-cut-form",
        ) as HTMLFormElement | null;
        form?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [options]);

  // Добавление записи
  const handleAddCut = useCallback(
    (event: MouseEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!cutTitle.trim()) return;

      addCut({
        name: cutTitle.trim(),
        code: selectedCode || undefined,
        profile: profile || undefined,
      });

      setCutTitle("");
      setSelectedCode("");
    },
    [cutTitle, selectedCode, profile, addCut],
  );

  // Редактирование записи
  const handleEditStart = (cut: TAdminCut) => {
    setEditingId(cut.id);
    setEditingName(cut.name);
    setEditingProfile((cut.profile as Profile) || "bar");
    setEditingCode(cut.code || "");
  };

  const handleEditSave = useCallback(
    (id: number) => {
      if (!editingName.trim()) return;

      updateCut({
        id,
        body: {
          name: editingName.trim(),
          profile: editingProfile,
          code: editingCode || undefined,
        },
      });

      setEditingId(null);
    },
    [editingName, editingProfile, editingCode, updateCut],
  );

  const handleEditCancel = () => {
    setEditingId(null);
  };

  // Удаление записи
  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm("Вы уверены, что хотите удалить эту резку?")) {
        deleteCut(id);
      }
    },
    [deleteCut],
  );

  const canSubmit =
    cutTitle.trim().length > 0 && !isAdding && selectedCode.length > 0;

  return (
    <div className={cnStyles()}>
      <h1 className={cnStyles("title")}>Резка</h1>

      {/* Переключатель профиля */}
      <div className={cnStyles("segment")}>
        <button
          type="button"
          className={cnStyles("segment-btn", { active: profile === "bar" })}
          onClick={() => {
            setProfile("bar");
            setSelectedCode("");
          }}
        >
          Пруток / круг
        </button>

        <button
          type="button"
          className={cnStyles("segment-btn", { active: profile === "sheet" })}
          onClick={() => {
            setProfile("sheet");
            setSelectedCode("");
          }}
        >
          Лист
        </button>
      </div>

      {/* Карточки выбора типа резки */}
      <div className={cnStyles("grid")}>
        {options.map((opt, i) => (
          <label
            key={opt.code}
            className={cnStyles("card", {
              selected: selectedCode === opt.code,
            })}
          >
            <input
              type="radio"
              className={cnStyles("radio-hidden")}
              name="cutType"
              value={opt.code}
              checked={selectedCode === opt.code}
              onChange={() => setSelectedCode(opt.code)}
            />

            <div className={cnStyles("card-icon")} aria-hidden />

            <div className={cnStyles("card-text")}>
              <div className={cnStyles("card-code")}>
                {i + 1}. {opt.code}
              </div>
              <div className={cnStyles("card-label")}>{opt.label}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Форма добавления */}
      <form
        id="add-cut-form"
        className={cnStyles("form")}
        onSubmit={handleAddCut}
      >
        <label className={cnStyles("field")}>
          <span className={cnStyles("field-label")}>Название резки</span>
          <input
            className={cnStyles("input")}
            type="text"
            name="name"
            value={cutTitle}
            onChange={handleFormChange}
            placeholder="Например: Резка круга 110/120 отрезным станком"
            required
          />
        </label>

        <button
          type="submit"
          className={cnStyles("primary-btn")}
          disabled={!canSubmit}
        >
          {isAdding ? "Добавляем…" : "Добавить"}
        </button>
      </form>

      {/* Список существующих */}
      {cuts.length > 0 ? (
        <section className={cnStyles("content-section")}>
          <ul className={cnStyles("items-list")}>
            {cuts.map((cut: TAdminCut) => (
              <li className={cnStyles("list-item")} key={cut.id}>
                {editingId === cut.id ? (
                  // Режим редактирования
                  <div className={cnStyles("list-item__edit")}>
                    <input
                      type="text"
                      className={cnStyles("list-item__input")}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Название резки"
                    />
                    <select
                      className={cnStyles("list-item__select")}
                      value={editingProfile}
                      onChange={(e) =>
                        setEditingProfile(e.target.value as Profile)
                      }
                    >
                      <option value="bar">Пруток / круг</option>
                      <option value="sheet">Лист</option>
                    </select>
                    <select
                      className={cnStyles("list-item__select")}
                      value={editingCode}
                      onChange={(e) => setEditingCode(e.target.value)}
                    >
                      <option value="">Выбрать тип резки...</option>
                      {ALL_TYPES.map((type) => (
                        <option key={type.code} value={type.code}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className={cnStyles("list-item__btn", { save: true })}
                      onClick={() => handleEditSave(cut.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Сохраняем…" : "Сохранить"}
                    </button>
                    <button
                      className={cnStyles("list-item__btn", { cancel: true })}
                      onClick={handleEditCancel}
                      disabled={isUpdating}
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  // Режим просмотра
                  <div className={cnStyles("list-item__view")}>
                    <span className={cnStyles("list-item__name")}>
                      {cut.name}
                    </span>
                    {cut.profile && (
                      <span className={cnStyles("list-item__profile")}>
                        {cut.profile === "bar" ? "Пруток/круг" : "Лист"}
                      </span>
                    )}
                    {cut.code && (
                      <span className={cnStyles("list-item__code")}>
                        {ALL_TYPES.find((t) => t.code === cut.code)?.label ||
                          cut.code}
                      </span>
                    )}
                    <button
                      className={cnStyles("list-item__btn", { edit: true })}
                      onClick={() => handleEditStart(cut)}
                      disabled={isUpdating || isDeleting}
                    >
                      ✏️ Редактировать
                    </button>
                    <button
                      className={cnStyles("list-item__btn", { delete: true })}
                      onClick={() => handleDelete(cut.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Удаляем…" : "✕ Удалить"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p>Строк с резкой пока нет</p>
      )}
    </div>
  );
};

export default AdminCutList;
