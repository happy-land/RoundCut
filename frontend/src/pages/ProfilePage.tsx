import { FC, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import block from "bem-cn";
import "./ProfilePage.scss";
import ArrowLeftIcon from "../images/react-icons/hi/HiOutlineArrowLeft.svg";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectAuth, setUser, updateUserData } from "../features/authSlice";
import { useUpdateMeMutation, useFetchUserMutation } from "../services/authApi";
import { useGetOrdersQuery } from "../services/ordersApi";
import { TOrder, TOwnUserData } from "../utils/types";
import { getCookie } from "../utils/cookie";

const cnStyles = block("profile-page");

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ProfilePage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);

  const { data: allOrders = [] } = useGetOrdersQuery();
  const lastOrders = allOrders.slice(0, 10);

  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [fetchUser] = useFetchUserMutation();

  const [isLoadingUser, setIsLoadingUser] = useState(!user);

  useEffect(() => {
    if (!user) {
      fetchUser(undefined)
        .unwrap()
        .then((data: TOwnUserData) => {
          const token = getCookie("accessToken") ?? "";
          dispatch(setUser({ user: data, token }));
        })
        .catch(() => {
          // токен невалиден — ничего не делаем, страница покажет fallback
        })
        .finally(() => setIsLoadingUser(false));
    }
  }, []);

  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(user?.about ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEditAbout = () => {
    setAboutDraft(user?.about ?? "");
    setSaveError(null);
    setEditingAbout(true);
  };

  const handleCancelAbout = () => {
    setEditingAbout(false);
    setSaveError(null);
  };

  const handleSaveAbout = async () => {
    try {
      const updated = await updateMe({ about: aboutDraft }).unwrap();
      dispatch(updateUserData({ about: (updated as { about?: string }).about ?? aboutDraft }));
      setEditingAbout(false);
      setSaveError(null);
    } catch {
      setSaveError("Не удалось сохранить. Попробуйте ещё раз.");
    }
  };

  if (isLoadingUser || !user) {
    return (
      <div className={cnStyles()}>
        <p className={cnStyles("empty")}>
          {isLoadingUser ? "Загрузка профиля..." : "Не удалось загрузить профиль"}
        </p>
      </div>
    );
  }

  return (
    <div className={cnStyles()}>
      {/* Шапка */}
      <div className={cnStyles("header")}>
        <NavLink to="/dashboard" className={cnStyles("back-btn")}>
          <img src={ArrowLeftIcon} alt="Назад" />
        </NavLink>
        <h1 className={cnStyles("title")}>Профиль</h1>
      </div>

      {/* Основная информация */}
      <section className={cnStyles("section")}>
        <div className={cnStyles("info-row")}>
          <span className={cnStyles("info-label")}>Email</span>
          <span className={cnStyles("info-value")}>{user.email}</span>
        </div>
        <div className={cnStyles("info-row")}>
          <span className={cnStyles("info-label")}>Имя</span>
          <span className={cnStyles("info-value")}>{user.username || "—"}</span>
        </div>
        <div className={cnStyles("info-row")}>
          <span className={cnStyles("info-label")}>Дата регистрации</span>
          <span className={cnStyles("info-value")}>
            {user.createdAt ? formatDate(user.createdAt) : "—"}
          </span>
        </div>
      </section>

      {/* О себе */}
      <section className={cnStyles("section")}>
        <div className={cnStyles("section-header")}>
          <h2 className={cnStyles("section-title")}>О себе</h2>
          {!editingAbout && (
            <button
              className={cnStyles("edit-btn")}
              onClick={handleEditAbout}
            >
              Редактировать
            </button>
          )}
        </div>

        {editingAbout ? (
          <div className={cnStyles("about-edit")}>
            <textarea
              className={cnStyles("about-textarea")}
              value={aboutDraft}
              onChange={(e) => setAboutDraft(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="Расскажите о себе..."
              autoFocus
            />
            <div className={cnStyles("about-edit__meta")}>
              <span className={cnStyles("about-edit__chars")}>
                {aboutDraft.length}/200
              </span>
            </div>
            {saveError && (
              <p className={cnStyles("about-edit__error")}>{saveError}</p>
            )}
            <div className={cnStyles("about-edit__actions")}>
              <button
                className={cnStyles("save-btn")}
                onClick={handleSaveAbout}
                disabled={isSaving}
              >
                {isSaving ? "Сохраняем..." : "Сохранить"}
              </button>
              <button
                className={cnStyles("cancel-btn")}
                onClick={handleCancelAbout}
                disabled={isSaving}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <p className={cnStyles("about-text")}>
            {user.about || <span className={cnStyles("about-text_empty")}>Не заполнено</span>}
          </p>
        )}
      </section>

      {/* Последние заказы */}
      <section className={cnStyles("section")}>
        <div className={cnStyles("section-header")}>
          <h2 className={cnStyles("section-title")}>Последние заказы</h2>
          <button
            className={cnStyles("orders-link")}
            onClick={() => navigate("/orders")}
          >
            Все заказы →
          </button>
        </div>

        {lastOrders.length === 0 ? (
          <p className={cnStyles("empty")}>Заказов пока нет</p>
        ) : (
          <ul className={cnStyles("orders-list")}>
            {lastOrders.map((order: TOrder) => (
              <li key={order.id} className={cnStyles("order-row")}>
                <div className={cnStyles("order-row__meta")}>
                  <span className={cnStyles("order-row__number")}>
                    Заказ #{order.id}
                  </span>
                  <span className={cnStyles("order-row__date")}>
                    {formatDateTime(order.createdAt)}
                  </span>
                  <span className={cnStyles("order-row__count")}>
                    {order.items.length} поз.
                  </span>
                </div>
                <span className={cnStyles("order-row__total")}>
                  {Number(order.totalAll).toFixed(0)} ₽
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
