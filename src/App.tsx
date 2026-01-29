import { useEffect, useRef, useState } from "react";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";

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
  const overlayRef = useRef<OverlayPanel>(null);
  const [selectedCount, setSelectedCount] = useState<number>();
  const [pendingGlobalCount, setPendingGlobalCount] = useState<number>(0);
  const globalCount = selectedId.size + pendingGlobalCount;
  console.log(`customSelection: ${selectedCount}`);
  console.log(`pending count ${pendingGlobalCount}`);
  const limit = 12;

  console.log(selectedId);

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
        inscriptions: item.inscriptions ? item.inscriptions : "N/A",
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

  useEffect(() => {
    if (pendingGlobalCount > 0 && artworkList.length > 0) {
      setSelectedId((prev) => {
        const updatedSelectedIds = new Set(prev);
        const rowToSelect = Math.min(pendingGlobalCount, artworkList.length);
        artworkList
          .slice(0, rowToSelect)
          .forEach((item) => updatedSelectedIds.add(item.id));
        return updatedSelectedIds;
      });
      setPendingGlobalCount((prev) => Math.max(0, prev - artworkList.length));
    }
  }, [artworkList]);

  const customCheckboxAndOverlayPanel = () => {
    return (
      <div className="headcheckbox">
        <input
          type="checkbox"
          checked={
            artworkList.length > 0 &&
            artworkList.every((a) => selectedId.has(a.id))
          }
          onChange={(e) => {
            setSelectedId((prev) => {
              const updatedSelectedIds = new Set(prev);
              if (e.target.checked) {
                artworkList.forEach((a) => updatedSelectedIds.add(a.id));
              } else {
                artworkList.forEach((a) => updatedSelectedIds.delete(a.id));
              }
              return updatedSelectedIds;
            });
          }}
        />
        <button
          type="button"
          onClick={(e) => overlayRef.current?.toggle(e)}
          style={{
            cursor: "pointer",
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <i className="pi pi-chevron-down" />
        </button>
        <OverlayPanel ref={overlayRef}>
          <div>
            <h4>Select Multiple Rows</h4>
            <p>Enter no of rows to select across all pages</p>
            <input
              type="number"
              style={{ marginRight: "10px", outline: "none" }}
              value={selectedCount}
              onChange={(e) => setSelectedCount(Number(e.target.value))}
              placeholder="eg 20"
            />
            <button
              type="button"
              onClick={() => {
                if (selectedCount <= 0) return;
                setSelectedId((prev) => {
                  const updatedSelectedIds = new Set(prev);
                  artworkList
                    .slice(0, selectedCount)
                    .forEach((item) => updatedSelectedIds.add(item.id));

                  const pendingCount = selectedCount - limit;
                  setPendingGlobalCount(pendingCount);
                  return updatedSelectedIds;
                });
                overlayRef.current?.hide();
              }}
            >
              Submit
            </button>
          </div>
        </OverlayPanel>
      </div>
    );
  };

  const customCheckBoxesForRows = (rowData: Artwork) => {
    return (
      <input
        type="checkbox"
        checked={selectedId.has(rowData.id)}
        onChange={() => {
          setSelectedId((prev) => {
            const updatedSelectedIds = new Set(prev);
            if (updatedSelectedIds.has(rowData.id)) {
              updatedSelectedIds.delete(rowData.id);
            } else {
              updatedSelectedIds.add(rowData.id);
            }
            return updatedSelectedIds;
          });
        }}
      />
    );
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalRecords);

  return (
    <div>
      <p>Selected: {globalCount} rows</p>
      <DataTable
        value={artworkList}
        key={currentPage + "-" + Array.from(selectedId).join(",")}
        rows={limit}
        dataKey="id"
        paginator
        paginatorLeft={
          <div>
            Showing {startIndex} to {endIndex} of {totalRecords} entries
          </div>
        }
        paginatorTemplate="PrevPageLink PageLinks NextPageLink"
        lazy
        totalRecords={totalRecords}
        first={(currentPage - 1) * limit}
        onPage={(e) => {
          if (e.page !== undefined) {
            setCurrentPage(e.page + 1);
          }
        }}
        rowClassName={(rowData) =>
          selectedId.has(rowData.id) ? "selected-row" : ""
        }
      >
        <Column
          header={customCheckboxAndOverlayPanel}
          body={(rowData) => customCheckBoxesForRows(rowData)}
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
