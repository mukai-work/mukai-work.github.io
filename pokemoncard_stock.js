import { useState, useEffect } from "react";

const DB_NAME = "pokemon_card_db";
const STORE_NAME = "cards";

// IndexedDB 初期化
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const addCard = async (card) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.add(card);
};

const getCards = async () => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

const updateStock = async (id, change) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const card = await new Promise((resolve) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
  });
  if (card) {
    card.stock = Math.max(0, card.stock + change);
    store.put(card);
  }
};

export default function InventoryApp() {
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ name: "", type: "", regulation: "", image: "", stock: 0 });

  useEffect(() => {
    getCards().then(setCards);
  }, []);

  const handleAddCard = async () => {
    await addCard({ ...newCard, stock: Number(newCard.stock) });
    setCards(await getCards());
    setNewCard({ name: "", type: "", regulation: "", image: "", stock: 0 });
  };

  const handleUpdateStock = async (id, change) => {
    await updateStock(id, change);
    setCards(await getCards());
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ポケモンカード在庫管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="p-4 bg-white rounded-lg shadow">
            <img src={card.image} alt={card.name} className="w-full h-40 object-cover" />
            <h2 className="text-lg font-bold mt-2">{card.name}</h2>
            <p>タイプ: {card.type}</p>
            <p>レギュレーション: {card.regulation}</p>
            <p>在庫数: {card.stock}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleUpdateStock(card.id, -1)} className="px-3 py-1 bg-red-500 text-white rounded">-</button>
              <button onClick={() => handleUpdateStock(card.id, 1)} className="px-3 py-1 bg-green-500 text-white rounded">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold">カードを追加</h2>
        <input type="text" placeholder="カード名" value={newCard.name} onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} className="border p-2 w-full mt-2" />
        <input type="text" placeholder="タイプ" value={newCard.type} onChange={(e) => setNewCard({ ...newCard, type: e.target.value })} className="border p-2 w-full mt-2" />
        <input type="text" placeholder="レギュレーション" value={newCard.regulation} onChange={(e) => setNewCard({ ...newCard, regulation: e.target.value })} className="border p-2 w-full mt-2" />
        <input type="text" placeholder="画像URL" value={newCard.image} onChange={(e) => setNewCard({ ...newCard, image: e.target.value })} className="border p-2 w-full mt-2" />
        <input type="number" placeholder="在庫数" value={newCard.stock} onChange={(e) => setNewCard({ ...newCard, stock: e.target.value })} className="border p-2 w-full mt-2" />
        <button onClick={handleAddCard} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">追加</button>
      </div>
    </div>
  );
}
