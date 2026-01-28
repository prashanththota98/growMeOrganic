import { useEffect, useState } from "react";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

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
  const [selectedId, setSelectedId] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const limit = 12;

  const fetchData = async (currentPage: number) => {
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}`,
      );
      const data = await response.json();
      console.log(data);
      setTotalRecords(data.pagination.total);

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
    fetchData(currentPage);
  }, [currentPage]);
  console.log(artworkList);

  const currentPageSelectedIds = artworkList.filter((art) =>
    selectedId.has(art.id),
  );

  const onSelectionChange = (e: any) => {
    const updatedSelectedIds = new Set(selectedId);

    const pageSelectedIds = new Set<number>(
      (e.value || []).map((row: Artwork) => row.id),
      console.log(e.value),
    );
    artworkList.forEach((art) => {
      if (pageSelectedIds.has(art.id)) {
        updatedSelectedIds.add(art.id);
      } else {
        updatedSelectedIds.delete(art.id);
      }
    });
    setSelectedId(updatedSelectedIds);
  };
  return (
    <div>
      <DataTable
        value={artworkList}
        rows={limit}
        dataKey="id"
        paginator
        lazy
        totalRecords={totalRecords}
        first={(currentPage - 1) * limit}
        onPage={(e) => {
          if (e.page !== undefined) {
            setCurrentPage(e.page + 1);
          }
        }}
        selection={currentPageSelectedIds}
        onSelectionChange={onSelectionChange}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column field="title" header="TITLE" />
        <Column field="placeOfOrigin" header="PLACE OF ORIGIN"></Column>
        <Column field="artistDisplay" header="ARTIST DISPLAY"></Column>
        <Column field="inscriptions" header="INSCRIPTIONS"></Column>
        <Column field="dateStart" header="START DATE"></Column>
        <Column field="dateEnd" header="END DATE"></Column>
      </DataTable>
    </div>
  );
}

export default App;
