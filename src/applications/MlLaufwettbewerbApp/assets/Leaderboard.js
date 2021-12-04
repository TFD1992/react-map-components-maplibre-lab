import React, { useEffect, useState, useContext } from "react";
import { MlGeoJsonLayer } from "@mapcomponents/react-maplibre";
import * as turf from "@turf/turf";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useTheme } from "@mui/material/styles";
import { AppContext } from "./AppContext";

import List from "@mui/material/List";
import LeaderboardEntry from "./LeaderboardEntry";

const usersPerPage = 8;

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [displayLeaders, setDisplayLeaders] = useState([]);
  const [individualProgress, setIndividualProgress] = useState({});
  const [selectedProgress, setSelectedProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState(false);
  const appContext = useContext(AppContext);

  const theme = useTheme();

  useEffect(() => {
    let tmpUsers = [...appContext.users];
    for (var i = 0, len = appContext.users.length; i < len; i++) {
      tmpUsers[i].distance = 0;
      if (typeof appContext.progressDataByUser[tmpUsers[i].id] !== "undefined") {
        tmpUsers[i].distance = appContext.progressDataByUser[tmpUsers[i].id];
      }
    }

    tmpUsers.sort((a, b) => {
      if (a.distance > b.distance) {
        return -1;
      }
      if (a.distance < b.distanceon) {
        return 1;
      }
      return 0;
    });

    setLeaders(tmpUsers);
  }, [appContext.users, appContext.progressDataByUser]);

  useEffect(() => {
    setDisplayLeaders(
      leaders.slice(
        currentPage * usersPerPage,
        currentPage * usersPerPage + usersPerPage
      )
    );
  }, [leaders, currentPage]);

  useEffect(() => {
    if (typeof selectedUser.distance !== "undefined" && selectedUser.distance > 0) {
      let tmpRouteProgess = turf.lineChunk(appContext.route, selectedUser.distance);
      if (typeof tmpRouteProgess.features[0] !== "undefined") {
        setSelectedProgress(tmpRouteProgess.features[0]);
      }
    }
  }, [selectedUser, appContext.route]);

  const showIndividualProgress = (distance) => {
    if (distance > 0) {
      let tmpRouteProgess = turf.lineChunk(appContext.route, distance);
      if (typeof tmpRouteProgess.features[0] !== "undefined") {
        setIndividualProgress(tmpRouteProgess.features[0]);
      }
    }
  };

  return (
    <>
      <div className="navigation">
        <ButtonGroup
          variant="contained"
          color="primary"
          aria-label="contained primary button group"
        >
          <Button
            size="small"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            {"<<"}
          </Button>
          <Button size="small" disabled={true}>
            {currentPage + 1}
          </Button>
          <Button
            size="small"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={(currentPage + 1) * usersPerPage >= leaders.length}
          >
            {">>"}
          </Button>
        </ButtonGroup>
      </div>
      <List>
        {displayLeaders.map((data, idx) => (
          <>
            <LeaderboardEntry
              onMouseOver={() => showIndividualProgress(data.distance)}
              onMouseLeave={() => setIndividualProgress(false)}
              onClick={() => setSelectedUser(data)}
              selectedUser={selectedUser}
              key={"lb_" + data.username}
              data={data}
              position={1 + idx + usersPerPage * currentPage}
            />
            {idx % (usersPerPage - 1) !== 0 && (
              <hr style={{ padding: 0, margin: "0 0 0 5%", width: "90%" }} />
            )}
          </>
        ))}
      </List>
      {selectedUser && (
        <MlGeoJsonLayer
          geojson={selectedProgress}
          paint={{
            "line-color": theme.palette.success.dark,
            "line-width": 6,
          }}
          type="line"
        />
      )}
      {individualProgress && (
        <MlGeoJsonLayer
          geojson={individualProgress}
          paint={{
            "line-color": theme.palette.error.dark,
            "line-width": 6,
          }}
          type="line"
        />
      )}
    </>
  );
}

export default Leaderboard;
