import { useEffect, useState } from "react";
import "./App.css";

interface Artwork {
  id: number;
  title: string;
  placeOfOrigin: string;
  artistDisplay: string;
  inscriptions: string | null;
  dateStart: number;
  dateEnd: number;
}

function App() {
  const [artworkList, setArtworkList] = useState<Artwork[]>([]);
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://api.artic.edu/api/v1/artworks?page=1",
      );
      const data = await response.json();
      const requiredData: Artwork[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        placeOfOrigin: item.place_of_origin,
        artistDisplay: item.artist_display,
        inscriptions: item.inscriptions,
        dateStart: item.date_start,
        dateEnd: item.date_end,
      }));
      setArtworkList(requiredData);
    } catch {
      console.log("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log(artworkList);
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}

export default App;
