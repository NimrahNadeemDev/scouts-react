/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Images
import logoXD from "assets/images/small-logos/logo-xd.svg";
import logoAtlassian from "assets/images/small-logos/logo-atlassian.svg";
import logoSlack from "assets/images/small-logos/logo-slack.svg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import logoJira from "assets/images/small-logos/logo-jira.svg";
import logoInvesion from "assets/images/small-logos/logo-invision.svg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data() {
  const avatars = (members) =>
    members.map(([image, name]) => (
      <Tooltip key={name} title={name} placeholder="bottom">
        <MDAvatar
          src={image}
          alt="name"
          size="xs"
          sx={{
            border: ({ borders: { borderWidth }, palette: { white } }) =>
              `${borderWidth[2]} solid ${white.main}`,
            cursor: "pointer",
            position: "relative",

            "&:not(:first-of-type)": {
              ml: -1.25,
            },

            "&:hover, &:focus": {
              zIndex: "10",
            },
          }}
        />
      </Tooltip>
    ));

  const Company = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "Job Details", accessor: "job", width: "45%", align: "left" },
      { Header: "Location", accessor: "location", align: "left" },
      { Header: "Schedule", accessor: "schedule", align: "left" },
      { Header: "Guards", accessor: "guards", align: "center" },
      { Header: "Status", accessor: "status", align: "center" },
    ],
    rows: [
      {
        job: (
          <MDBox
            maxWidth="150px"
            sx={{
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            <MDTypography variant="text" color="gray">
              Patrol the warehouse perimeter
            </MDTypography>
            <MDTypography variant="text" color="gray">
              Monitor CCTV feeds. Report any suspicious activity.
            </MDTypography>
            <MDTypography variant="caption" color="gray">
              ID: #1
            </MDTypography>
          </MDBox>
        ),
        location: (
          <MDTypography variant="caption" color="text">
            123 Industrial Park, Springfield, IL 62704
          </MDTypography>
        ),
        schedule: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="medium">
              Start: Nov 21, 2025 · 03:00 AM
            </MDTypography>
            <MDTypography variant="caption" color="text">
              End: Nov 21, 2025 · 11:00 AM
            </MDTypography>
          </MDBox>
        ),
        guards: (
          <MDTypography variant="button" fontWeight="medium">
            2
          </MDTypography>
        ),
        status: (
          <MDTypography variant="caption" fontWeight="bold" color="success">
            Open
          </MDTypography>
        ),
      },
      {
        job: (
          <MDBox
            maxWidth="150px"
            sx={{
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            <MDTypography variant="text" color="gray">
              Event Security
            </MDTypography>
            <MDTypography variant="text" color="gray">
              Needed security for my office
            </MDTypography>
            <MDTypography variant="text" color="gray">
              ID: #34
            </MDTypography>
          </MDBox>
        ),
        location: (
          <MDTypography variant="caption" color="text">
            C8XH+64, Lahore, Pakistan
          </MDTypography>
        ),
        schedule: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="medium">
              Start: Nov 19, 2025 · 02:43 PM
            </MDTypography>
            <MDTypography variant="caption" color="text">
              End: Nov 19, 2025 · 10:43 PM
            </MDTypography>
          </MDBox>
        ),
        guards: (
          <MDTypography variant="button" fontWeight="medium">
            2
          </MDTypography>
        ),
        status: (
          <MDTypography variant="caption" fontWeight="bold" color="success">
            Open
          </MDTypography>
        ),
      },
      {
        job: (
          <MDBox
            maxWidth="150px"
            sx={{
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            <MDTypography variant="text" color="gray">
              Event Security
            </MDTypography>
            <MDTypography variant="text" color="gray">
              Needed security for my son&apos;s wedding
            </MDTypography>
            <MDTypography variant="text" color="gray">
              ID: #35
            </MDTypography>
          </MDBox>
        ),
        location: (
          <MDTypography variant="caption" color="text">
            76D, Block D, Model Town, Lahore
          </MDTypography>
        ),
        schedule: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="medium">
              Start: Nov 19, 2025 · 02:30 PM
            </MDTypography>
            <MDTypography variant="caption" color="text">
              End: Nov 19, 2025 · 10:30 PM
            </MDTypography>
          </MDBox>
        ),

        guards: (
          <MDTypography variant="button" fontWeight="medium">
            1
          </MDTypography>
        ),

        status: (
          <MDTypography variant="caption" fontWeight="bold" color="success">
            Open
          </MDTypography>
        ),
      },
    ],
  };
}
