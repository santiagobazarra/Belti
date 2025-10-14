<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Solicitudes - Belti</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            /* Changed to Arial for better readability and professional appearance */
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.5;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 30px 40px;
        }

        .header {
            border-bottom: 2px solid #000000;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            gap: 20px;
        }

        /* Logo without any background, border, or frame - just the image */
        .logo {
            width: 40px;
            height: 100px;
            flex-shrink: 0;
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .header-info {
            flex: 1;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 5px;
        }

        .report-title {
            font-size: 14px;
            color: #333333;
            margin-bottom: 3px;
            font-weight: bold;
        }

        .report-period {
            font-size: 12px;
            color: #666666;
        }

        .summary-section {
            margin-bottom: 30px;
            background: #f5f5f5;
            padding: 15px;
            border: 1px solid #cccccc;
        }

        .summary-title {
            font-size: 13px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 12px;
            text-align: center;
            text-transform: uppercase;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #cccccc;
        }

        .summary-table th,
        .summary-table td {
            padding: 10px;
            text-align: center;
            border: 1px solid #cccccc;
        }

        .summary-table th {
            background: #333333;
            font-weight: bold;
            font-size: 10px;
            color: #ffffff;
            text-transform: uppercase;
        }

        .summary-table td {
            font-size: 11px;
            color: #333333;
        }

        .summary-number {
            font-size: 20px;
            font-weight: bold;
            color: #000000;
            display: block;
            margin-bottom: 3px;
        }

        .summary-label {
            font-size: 9px;
            color: #666666;
            text-transform: lowercase;
        }

        /* Completely redesigned table with better spacing and readability */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 1px solid #000000;
        }

        .data-table th {
            background: #333333;
            color: #ffffff;
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            border: 1px solid #000000;
        }

        .data-table td {
            padding: 8px;
            border: 1px solid #cccccc;
            font-size: 10px;
            color: #000000;
            vertical-align: middle;
        }

        .data-table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }

        /* Improved badge design with better contrast and visibility */
        .status-badge {
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
            white-space: nowrap;
        }

        .status-pendiente {
            background: #fff3e0;
            color: #e65100;
            border: 1px solid #ff9800;
        }

        .status-aprobada {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #4caf50;
        }

        .status-rechazada {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #f44336;
        }

        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #cccccc;
            text-align: center;
            color: #666666;
            font-size: 8px;
            line-height: 1.5;
        }

        .footer p {
            margin-bottom: 3px;
        }

        .no-data {
            text-align: center;
            padding: 30px 20px;
            color: #666666;
            font-style: italic;
        }

        /* Better column-specific styling */
        .employee-name {
            font-weight: bold;
            color: #000000;
        }

        .date-cell {
            text-align: center;
            font-family: 'Courier New', monospace;
        }

        .status-cell {
            text-align: center;
        }

        .type-cell {
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }

        @media print {
            body {
                margin: 0;
                padding: 20px 30px;
            }
            
            .data-table tbody tr {
                page-break-inside: avoid;
            }

            * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }

        @page {
            margin: 1.5cm;
        }
    </style>
</head>
<body>
    
    <div class="header">
        <div class="logo"><img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMTAwJSIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHBhdGggZmlsbD0iIzI1NjNlZiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9IgpNMTM2LjY2NjQ0MywzMjIuMjM2NTcyIAoJQzEzNi4yNzE2NjcsMzE3LjM0MTc2NiAxMzguNjgwNDY2LDMxNS44Mjk2NTEgMTQyLjY5NTYwMiwzMTUuODM0NzE3IAoJQzE3Ni44NDk5MzAsMzE1Ljg3NzY1NSAyMTEuMDExODU2LDMxNS40NzYxMzUgMjQ1LjE1NTc5MiwzMTYuMDg2NDU2IAoJQzI2NS41MzYwMTEsMzE2LjQ1MDc0NSAyODUuNjc4NjgwLDMxOS4zNzgyNjUgMzAzLjY3NDgzNSwzMzAuMTg4MjkzIAoJQzMyMy44NzMyNjAsMzQyLjMyMTI1OSAzMzQuNjE0NDcxLDM1OS45MTIxNzAgMzM1LjQ3MjQ3MywzODMuODIyODc2IAoJQzMzNi41MTU5NjEsNDEyLjkwMjkyNCAzMjMuOTcyMTY4LDQzMy42NDA5MDAgMjk4Ljc2NjY5Myw0NDcuMzIxNTAzIAoJQzI5Ny4wODI0NTgsNDQ4LjIzNTY1NyAyOTQuNTcxNzE2LDQ0OC43MzI5NDEgMjk0LjU2NTIxNiw0NTEuMTE1NzUzIAoJQzI5NC41NTc5ODMsNDUzLjc2OTcxNCAyOTcuMzQ3MjYwLDQ1My42ODkxNDggMjk5LjA0Mzk3Niw0NTQuMzQyNzczIAoJQzMwOC44ODEzNDgsNDU4LjEzMjY2MCAzMTguMzYxMjA2LDQ2Mi41OTI0OTkgMzI2Ljc0MTE1MCw0NjkuMDYxMDY2IAoJQzM0MS43OTQ1NTYsNDgwLjY4MTAwMCAzNDguNzM0NTg5LDQ5Ni40MzgzMjQgMzUwLjQwMzM4MSw1MTUuMDc0MDM2IAoJQzM1Mi4yNTM1MTAsNTM1LjczNDg2MyAzNDcuNTM5NjEyLDU1NC4zOTU5MzUgMzM0LjQzMjIyMCw1NzAuNjI2NzA5IAoJQzMyMi44NjA3NDgsNTg0Ljk1NTUwNSAzMDcuNzQyNTIzLDU5NC4wMDg2MDYgMjkwLjI2MzQ1OCw1OTkuMjcxNzkwIAoJQzI3Ni40ODc0NTcsNjAzLjQxOTkyMiAyNjIuNDU5NDczLDYwNS41NTYyNzQgMjQ3Ljk4MDEzMyw2MDUuNDQ3OTM3IAoJQzIxMy4zMjc0MjMsNjA1LjE4ODU5OSAxNzguNjcxNDMyLDYwNS4zNzQ1MTIgMTQ0LjAxNjc1NCw2MDUuMzY3Nzk4IAoJQzEzNi45ODMwNzgsNjA1LjM2NjQ1NSAxMzYuNjQ5MDYzLDYwNS4wMTY2MDIgMTM2LjYyMzA3Nyw1OTguMDQ0MDY3IAoJQzEzNi40NTMwMTgsNTUyLjM5ODY4MiAxMzYuMTQ5MjAwLDUwNi43NTMyMzUgMTM2LjE1NzAyOCw0NjEuMTA3ODgwIAoJQzEzNi4xNjQ5MzIsNDE0Ljk3NDg1NCAxMzYuNDgyNjk3LDM2OC44NDE4NTggMTM2LjY2NjQ0MywzMjIuMjM2NTcyIApNMjAzLjY3NzkxNyw0NzMuOTM5NjM2IAoJQzIwMS41MTI0MDUsNDc1LjAxNTkzMCAyMDEuMzQ1ODI1LDQ3Ny4wMzUzMDkgMjAxLjM0MDc3NSw0NzkuMDY3NTk2IAoJQzIwMS4yNzE2NTIsNTA2Ljg4ODU4MCAyMDEuMjQyODQ0LDUzNC43MDk2NTYgMjAxLjEzNDA3OSw1NjIuNTMwNDU3IAoJQzIwMS4xMjI0NjcsNTY1LjQ5NDY5MCAyMDIuMjMyMzAwLDU2Ni43MjU1MjUgMjA1LjI0NDQxNSw1NjYuNzA1MDE3IAoJQzIxOC43MDg0MzUsNTY2LjYxMzE1OSAyMzIuMTk4MDEzLDU2Ny4yODU1MjIgMjQ1LjUzOTUyMCw1NjQuNjQyMDkwIAoJQzI1Ny40NTU5MDIsNTYyLjI4MTAwNiAyNjguMjcyNjc1LDU1Ny45MDY2NzcgMjc1LjY5MDUyMSw1NDcuNzIwMzk4IAoJQzI5NC42ODQ3MjMsNTIxLjYzNzM5MCAyODEuNzUxNTg3LDQ4NS4xNDg0OTkgMjUwLjU5NjI5OCw0NzYuMzg4OTc3IAoJQzIzNS4zODgwMTYsNDcyLjExMzAzNyAyMTkuOTA5NTE1LDQ3My4zODg4ODUgMjAzLjY3NzkxNyw0NzMuOTM5NjM2IApNMjUxLjg4MTU0NiwzNTkuNTg3MTg5IAoJQzI1MS4yOTYxNzMsMzU5LjI2OTcxNCAyNTAuNzE0NTg0LDM1OC45NDUwNjggMjUwLjEyNDg0NywzNTguNjM1ODk1IAoJQzIzNS45MzQ5OTgsMzUxLjE5Njc3NyAyMjAuNTg5NDE3LDM1My41MzYwNzIgMjA1LjU0NjQ0OCwzNTMuNDM5MzMxIAoJQzIwMi43MzQ4NzksMzUzLjQyMTI2NSAyMDIuMTY5NzM5LDM1NS42MTU1NDAgMjAyLjExNjE5NiwzNTguMDA0NzMwIAoJQzIwMS45ODU3MDMsMzYzLjgyNzY5OCAyMDEuNjk4NzMwLDM2OS42NDg2NTEgMjAxLjY1NTU2MywzNzUuNDcxODAyIAoJQzIwMS41MTYwOTgsMzk0LjI4MDgyMyAyMDEuNDQ3NjkzLDQxMy4wOTA0MjQgMjAxLjM4MDc1Myw0MzEuODk5OTAyIAoJQzIwMS4zNzEzNTMsNDM0LjUzODQyMiAyMDIuMzkyNzkyLDQzNi41OTYyMjIgMjA1LjM3MTc5Niw0MzYuNTgzNjc5IAoJQzIxNi42NjM0MjIsNDM2LjUzNjEzMyAyMjguMDQxMTUzLDQzNy42MDQzNzAgMjM5LjE5MjEyMyw0MzUuMTU5ODIxIAoJQzI1Ny40NDM1NDIsNDMxLjE1ODc1MiAyNjcuOTI5NDQzLDQxOC43MzE2NTkgMjY5LjUwNjI1NiwzOTkuMTkzMzI5IAoJQzI3MC43OTczMzMsMzgzLjE5NTE5MCAyNjcuNTk2OTU0LDM2OC45NTcxMjMgMjUxLjg4MTU0NiwzNTkuNTg3MTg5IAp6Ii8+CjxwYXRoIGZpbGw9IiMyNTYzZWIiIG9wYWNpdHk9IjEuMDAwMDAwIiBzdHJva2U9Im5vbmUiCglkPSIKTTU1Ny4zNDkwNjAsNTY2Ljk5ODUzNSAKCUM1NTcuMzQ5MDYwLDU2OS44MzA1MDUgNTU3LjAwMzY2Miw1NzIuMjI1MTU5IDU1Ny40MTA0NjEsNTc0LjQ4NDMxNCAKCUM1NTguODkyOTQ0LDU4Mi43MTY5ODAgNTU1LjAxMDYyMCw1ODcuMDY0NDUzIDU0Ny45MTE1NjAsNTkwLjcxOTExNiAKCUM1MjguMDIzODA0LDYwMC45NTc2NDIgNTA3LjEwOTg2Myw2MDYuNzE0NjYxIDQ4NC43NzExNDksNjA3LjMyMzYwOCAKCUM0NjkuNDExMjg1LDYwNy43NDIyNDkgNDU0LjExOTk5NSw2MDcuMDYwNTQ3IDQzOS4yOTEyMjksNjAyLjY1OTExOSAKCUM0MDEuNTk1MTg0LDU5MS40NzAzOTggMzc3Ljg5ODA3MSw1NjYuNzIxMDY5IDM3MC4xMDEwNzQsNTI4LjE0NzI3OCAKCUMzNjMuNDIyNTQ2LDQ5NS4xMDY3MjAgMzY4LjEyNDQ4MSw0NjMuNDU4MTYwIDM4Ny4wNTU4MTcsNDM0Ljk1NjIzOCAKCUM0MDMuNjM0MzA4LDQwOS45OTY0OTAgNDI3LjI5MjI5NywzOTUuODkyODgzIDQ1Ni45MzU5MTMsMzkxLjUzOTMwNyAKCUM0NzUuMzE1NTgyLDM4OC44Mzk5OTYgNDkzLjM2MDkzMSwzODkuNTcwODMxIDUxMS4wOTcyOTAsMzk1LjM3MjQwNiAKCUM1MzQuNTU5NzUzLDQwMy4wNDY5MDYgNTQ5Ljk4NTQxMyw0MTguODE1MTI1IDU1OC41ODg5ODksNDQxLjgwMDU2OCAKCUM1NjYuMTM3ODc4LDQ2MS45NjgyMDEgNTY1LjU2ODIzNyw0ODIuOTExMTAyIDU2NS4yOTI2NjQsNTAzLjg2NTkwNiAKCUM1NjUuMjU1MzcxLDUwNi43MDM1MjIgNTYzLjUwMzI5Niw1MDguMDI2Nzk0IDU2MC44MDU1NDIsNTA4LjE5ODA1OSAKCUM1NTkuNDc3MjM0LDUwOC4yODIzMTggNTU4LjE0MTIzNSw1MDguMjYxODEwIDU1Ni44MDg3MTYsNTA4LjI2MTU5NyAKCUM1MTcuOTg5Njg1LDUwOC4yNTU1MjQgNDc5LjE3MDYyNCw1MDguMjUwNjEwIDQ0MC4zNTE1NjIsNTA4LjIzMzgyNiAKCUM0MzEuMTcxODE0LDUwOC4yMjk4NTggNDMwLjU0NTEwNSw1MDkuMDY5OTc3IDQzMi4yMDk3NDcsNTE4LjAzNTg4OSAKCUM0MzMuNzgzNzUyLDUyNi41MTM3MzMgNDM2Ljg4NDU4Myw1MzQuMjk5OTI3IDQ0MS44MzQxMzcsNTQxLjM2ODgzNSAKCUM0NTEuOTY1NDU0LDU1NS44MzgyNTcgNDY2LjQxNDk0OCw1NjIuMzM5NzIyIDQ4My40OTgzNTIsNTYzLjYxNDYyNCAKCUM1MDYuNjYxOTU3LDU2NS4zNDMxNDAgNTI3LjQzNDIwNCw1NTguMDI0MzUzIDU0Ni45MjAzNDksNTQ2LjE4OTU3NSAKCUM1NDguMDU5MjY1LDU0NS40OTc4NjQgNTQ5LjE4NzYyMiw1NDQuNzg0ODUxIDU1MC4zNTYyMDEsNTQ0LjE0NjM2MiAKCUM1NTUuMTM1ODAzLDU0MS41MzQ3MjkgNTU3LjIxNjE4Nyw1NDIuNjM4Nzk0IDU1Ny4zMTI3NDQsNTQ4LjAwNjY1MyAKCUM1NTcuNDIzNTIzLDU1NC4xNjkwMDYgNTU3LjM0NTAzMiw1NjAuMzM0Nzc4IDU1Ny4zNDkwNjAsNTY2Ljk5ODUzNSAKTTQ2My40OTk5MzksNDc0LjY0MzA2NiAKCUM0NzUuOTg3MjEzLDQ3NC42MzI5NjUgNDg4LjQ3NjI4OCw0NzQuNTAwNDg4IDUwMC45NjA3ODUsNDc0LjY4MjM0MyAKCUM1MDUuMDYzMTQxLDQ3NC43NDIwNjUgNTA2Ljk3ODg1MSw0NzMuMjM3NTE4IDUwNi42MDQ0OTIsNDY5LjE5NjA0NSAKCUM1MDUuNDE0MzY4LDQ1Ni4zNDgyMDYgNTAyLjAzOTY3Myw0NDQuMzIyNTcxIDQ5Mi44NzcwNzUsNDM0LjY1OTA4OCAKCUM0ODIuOTMxOTE1LDQyNC4xNzAyNTggNDY3Ljg2MjM5Niw0MjEuNzYwOTg2IDQ1NS4zODU1OTAsNDI5LjAzNDUxNSAKCUM0MzkuNTE1Nzc4LDQzOC4yODYxMDIgNDM0LjE2MzI2OSw0NTMuODMxODc5IDQzMS4zNjkxMTAsNDcwLjcyMzQxOSAKCUM0MzAuODM5MTExLDQ3My45Mjc1NTEgNDMyLjcwNTI2MSw0NzQuNjc5NDEzIDQzNS41Mjc2MTgsNDc0LjY1NDU3MiAKCUM0NDQuNTE3NzAwLDQ3NC41NzU0MDkgNDUzLjUwOTA2NCw0NzQuNjM1NTkwIDQ2My40OTk5MzksNDc0LjY0MzA2NiAKeiIvPgo8cGF0aCBmaWxsPSIjMjU2M2ViIiBvcGFjaXR5PSIxLjAwMDAwMCIgc3Ryb2tlPSJub25lIgoJZD0iCk00MzguMzI3MzAxLDY0MC45ODg0MDMgCglDNDcxLjYzOTU4Nyw2MzguNjE3NjE1IDUwNC41MTU5MzAsNjM2Ljc4NjY4MiA1MzcuNDM4MDQ5LDYzNS40MDUzOTYgCglDNTg5Ljc0NzMxNCw2MzMuMjEwNTcxIDY0Mi4wNTI0OTAsNjMzLjQ2MzEzNSA2OTQuMzYxMDg0LDYzMy45NjM2MjMgCglDNzIxLjE1NTgyMyw2MzQuMjE5OTEwIDc0Ny45NTM3MzUsNjM1LjQ5MTIxMSA3NzQuNzIxMDA4LDYzNi44NzA0ODMgCglDNzk4LjQ2NTgyMCw2MzguMDkzOTk0IDgyMi4xODM0MTEsNjM5LjkzNTk3NCA4NDUuODg2ODQxLDY0MS44MzMwNjkgCglDODU3LjMwNDk5Myw2NDIuNzQ2OTQ4IDg2OC42NjYwNzcsNjQ0LjM4NzU3MyA4ODAuMDQ0ODAwLDY0NS43NjcwOTAgCglDODgyLjM2NjI3Miw2NDYuMDQ4NTg0IDg4NC42OTQ2NDEsNjQ2LjYwMjg0NCA4ODYuMjA4Mzc0LDY0OC42NDgzMTUgCglDODg3Ljc0MjMxMCw2NTAuNzIxMTkxIDg4Ny42OTI0NDQsNjUzLjAzMzM4NiA4ODYuNzMzMTU0LDY1NS4yODY5MjYgCglDODg1LjU4NDkwMCw2NTcuOTg0MjUzIDg4My4yNDI2NzYsNjU4LjY4MzQ3MiA4ODAuNTUyMDAyLDY1OC41MTgzNzIgCglDODY0LjkzNzUwMCw2NTcuNTYwMzAzIDg0OS4zMzE3MjYsNjU2LjQyOTY4OCA4MzMuNzA3OTQ3LDY1NS42NjQwNjIgCglDODIwLjg5OTEwOSw2NTUuMDM2Mzc3IDgwOC4wNzE3MTYsNjU0LjY1NTY0MCA3OTUuMjQ4MjkxLDY1NC40ODEwNzkgCglDNzYxLjc1ODExOCw2NTQuMDI1MzMwIDcyOC4yNzk3MjQsNjU0LjYzMDAwNSA2OTQuODE2ODk1LDY1Ni4wNTcwNjggCglDNjc3LjM1MDE1OSw2NTYuODAyMDAyIDY1OS44NzUyNDQsNjU3LjQwNjU1NSA2NDIuNDIwODM3LDY1OC4zNzY2NDggCglDNjIyLjgyODk3OSw2NTkuNDY1NDU0IDYwMy4yNzc5NTQsNjYxLjEwNzE3OCA1ODMuNzQzMjI1LDY2My4wMzE5ODIgCglDNTY1LjIxNTQ1NCw2NjQuODU3NjY2IDU0Ni43Mjg4ODIsNjY2Ljk4MTE0MCA1MjguMjQ0MTQxLDY2OS4xNzM0NjIgCglDNTA5LjI2NzYwOSw2NzEuNDI0MTk0IDQ5MC4zOTE1MTAsNjc0LjMzNDE2NyA0NzEuNDg5OTkwLDY3Ny4xMTA0MTMgCglDNDMxLjAzNTk4MCw2ODMuMDUyMTI0IDM5MC44OTk2NTgsNjkwLjY4NTMwMyAzNTEuMDAzMTQzLDY5OS41NDc1NDYgCglDMzEyLjM0NjY0OSw3MDguMTM0Mzk5IDI3NC4xODE0NTgsNzE4LjY1MTY3MiAyMzYuMTQ1MTU3LDcyOS42NTE3MzMgCglDMjI3LjU0NzQ4NSw3MzIuMTM4MTIzIDIxOC45NTQ2NTEsNzM0LjcwNzA5MiAyMDkuOTQzMjA3LDczNS43NDM0NjkgCglDMTk3Ljc0MTIyNiw3MzcuMTQ2NzI5IDE4Ni4zNTQyMDIsNzM1LjE3NjI3MCAxNzUuODEwNDU1LDcyOC45OTE2MzggCglDMTYyLjY3MDYzOSw3MjEuMjg0MjQxIDE1MS45Nzg3OTAsNzEwLjg5MDkzMCAxNDMuMzYxOTg0LDY5OC4zNTIyOTUgCglDMTQyLjUxNDg2Miw2OTcuMTE5NTY4IDE0MS43NTIwMjksNjk1LjgxNjU4OSAxNDEuMDcwODMxLDY5NC40ODQzNzUgCglDMTM4LjAwMzIyMCw2ODguNDg1MDQ2IDEzOS4zNjc3MjIsNjg1LjMyMDEyOSAxNDUuODA4MTk3LDY4NC4wMjIyNzggCglDMTU4LjM0NTEyMyw2ODEuNDk1OTExIDE3MC44OTU0MzIsNjc5LjAyODgwOSAxODMuNDcwMTIzLDY3Ni42OTg3MzAgCglDMjA2LjY1MTA3Nyw2NzIuNDAzMzIwIDIyOS43OTY1MDksNjY3Ljg3MjkyNSAyNTMuMDYyNjA3LDY2NC4wOTE5MTkgCglDMjc4LjQ1NTI2MSw2NTkuOTY1MjcxIDMwMy44MTMwNDksNjU1LjU0ODA5NiAzMjkuMzg5MDM4LDY1Mi42MDEyNTcgCglDMzUxLjQ5MDcyMyw2NTAuMDU0ODEwIDM3My41NjM2OTAsNjQ3LjI1MDkxNiAzOTUuNjgwNTQyLDY0NC44NDc1MzQgCglDNDA5LjcxNjY3NSw2NDMuMzIyMzI3IDQyMy44MDk3NTMsNjQyLjMyMTU5NCA0MzguMzI3MzAxLDY0MC45ODg0MDMgCnoiLz4KPHBhdGggZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9IgpNODA2LjU2MDkxMyw0MDAuNzUyNDcyIAoJQzgwNy45MDE2MTEsNDExLjU4OTg0NCA4MDcuMjYxMTA4LDQyMi4wNzgzMDggODA3LjE3MTIwNCw0MzIuNTUxNDUzIAoJQzgwNy4xMzc3NTYsNDM2LjQ1MTE0MSA4MDQuMDI5OTA3LDQzNy4xODY0OTMgODAwLjc0Mzk1OCw0MzcuMTkyNzQ5IAoJQzc4OS41ODA1NjYsNDM3LjIxNDA1MCA3NzguNDE3MTE0LDQzNy4yNTQ1MTcgNzY3LjI1MzcyMyw0MzcuMjg4MzYxIAoJQzc2MC4zNjkwMTksNDM3LjMwOTIwNCA3NjAuMzU4MDMyLDQzNy4zMDk3NTMgNzYwLjM1NjIwMSw0NDQuMjA4NTU3IAoJQzc2MC4zNDg3NTUsNDcyLjcwMDUzMSA3NjAuNDEwNzA2LDUwMS4xOTI4MTAgNzYwLjI4NzIzMSw1MjkuNjg0MjY1IAoJQzc2MC4yNjU0NDIsNTM0LjcxMTc5MiA3NjAuNzYyOTM5LDUzOS42NjAwOTUgNzYxLjQ3NzUzOSw1NDQuNTgxNjA0IAoJQzc2My4wMTE0NzUsNTU1LjE0NTkzNSA3NzIuNTk4MDgzLDU2My40MDcxMDQgNzgzLjMwOTI2NSw1NjMuNzMyMjM5IAoJQzc4OS4zMTkyNzUsNTYzLjkxNDYxMiA3OTUuMjY0NTg3LDU2My41ODE2MDQgODAxLjEzMDM3MSw1NjIuMDg3MjgwIAoJQzgwNS4wNzc2MzcsNTYxLjA4MTY2NSA4MDcuMjk1MTA1LDU2Mi42OTM0MjAgODA3LjMxMjE5NSw1NjYuODU3Nzg4IAoJQzgwNy4zNDg0NTAsNTc1LjY4ODM1NCA4MDcuMjk1NjU0LDU4NC41MTkzNDggODA3LjMzNjA2MCw1OTMuMzQ5OTE1IAoJQzgwNy4zNTI3MjIsNTk2Ljk5Mjk4MSA4MDUuMDE2NjYzLDU5OC41NzAzNzQgODAyLjEwMjc4Myw1OTkuODQ3MDQ2IAoJQzc4NS4zMDU3MjUsNjA3LjIwNjU0MyA3NjcuNjk2MTA2LDYwOC40MTIwNDggNzQ5LjcyNjEzNSw2MDYuNzU4MjQwIAoJQzczOS42MTAwNDYsNjA1LjgyNzMzMiA3MzAuMjE3ODk2LDYwMi43MDc1ODEgNzIxLjczNDk4NSw1OTcuMDE0MTYwIAoJQzcwOC42MTk2OTAsNTg4LjIxMTczMSA3MDEuODM0NTM0LDU3NS40OTYyMTYgNzAwLjc2NTY4Niw1NjAuMTYzMzMwIAoJQzY5OC4xNDUzODYsNTIyLjU3NjI5NCA3MDAuMjc5MjM2LDQ4NC45MTA3MDYgNjk5LjY2MDQ2MSw0NDcuMjg0MDU4IAoJQzY5OS42MzU4MDMsNDQ1Ljc4NDg1MSA2OTkuNTI0NzE5LDQ0NC4yNzE5NzMgNjk5LjY3NTQxNSw0NDIuNzg3OTAzIAoJQzcwMC4wODMxOTEsNDM4Ljc3MDk2NiA2OTguNTg1NzU0LDQzNy4wNDk4NjYgNjk0LjMzMzk4NCw0MzcuMjM4MjIwIAoJQzY4Ny44NDgxNDUsNDM3LjUyNTUxMyA2ODEuMzM3MzQxLDQzNy4yMDkwMTUgNjc0Ljg0NDkxMCw0MzcuNDA1NjA5IAoJQzY3MC45OTg0NzQsNDM3LjUyMjA5NSA2NjkuNDEyMjkyLDQzNi4xMjU3MzIgNjY5LjUwMDU0OSw0MzIuMTY5MjIwIAoJQzY2OS43MDUxMzksNDIzLjAwOTI0NyA2NjkuNzM2Mzg5LDQxMy44NDEwNjQgNjY5LjYwMDc2OSw0MDQuNjc5NzE4IAoJQzY2OS41Mzc1OTgsNDAwLjQwNTgyMyA2NzEuMjY5NTkyLDM5OC41OTkwNjAgNjc1LjUxODczOCwzOTguNjgxNzMyIAoJQzY4Mi4wMTQzNDMsMzk4LjgwODA3NSA2ODguNTE2OTY4LDM5OC41OTQwNTUgNjk1LjAxMTQ3NSwzOTguNzQ1Nzg5IAoJQzY5OC40Nzg5NDMsMzk4LjgyNjc4MiA2OTkuNzMwMTAzLDM5Ny40MzA5MDggNjk5LjY4NzE5NSwzOTQuMDE3MDU5IAoJQzY5OS41NTczNzMsMzgzLjY4ODIwMiA2OTkuNzU0MDI4LDM3My4zNTQ0MzEgNjk5LjU1NDQ0MywzNjMuMDI3NzQwIAoJQzY5OS40ODg3NzAsMzU5LjYzMzM5MiA3MDAuNjQyMDkwLDM1Ny45MTUxMzEgNzAzLjg3MjE5MiwzNTYuODY0NDQxIAoJQzcyMC4xNzE1NzAsMzUxLjU2MjYyMiA3MzYuNDAxMzA2LDM0Ni4wNDcwODkgNzUyLjY4NDk5OCwzNDAuNjk2MzgxIAoJQzc1OC40MjQ1NjEsMzM4LjgxMDQyNSA3NjAuMzI0MjE5LDM0MC4yNzg3NzggNzYwLjMzNzE1OCwzNDYuNDEyNzUwIAoJQzc2MC4zNjk4MTIsMzYxLjkwODMyNSA3NjAuNTM2MzE2LDM3Ny40MDc1OTMgNzYwLjIzODE1OSwzOTIuODk3NDkxIAoJQzc2MC4xNDU3NTIsMzk3LjY5OTQ5MyA3NjEuODc3MzgwLDM5OC44NjAyMjkgNzY2LjI4OTEyNCwzOTguNzY5NDA5IAoJQzc3Ny40NDc5MzcsMzk4LjUzOTczNCA3ODguNjE0NTYzLDM5OC42ODg5MDQgNzk5Ljc3ODA3NiwzOTguNjg5NTQ1IAoJQzgwMi4wOTU3MDMsMzk4LjY4OTY5NyA4MDQuNTAxMzQzLDM5OC4zNjM3MDggODA2LjU2MDkxMyw0MDAuNzUyNDcyIAp6Ii8+CjxwYXRoIGZpbGw9IiMyNTYzZWIiIG9wYWNpdHk9IjEuMDAwMDAwIiBzdHJva2U9Im5vbmUiCglkPSIKTTU4Ni42OTQwOTIsMzYwLjk5OTkzOSAKCUM1ODYuNjkxNjUwLDM1MC4xNjg1MTggNTg2LjgxOTIxNCwzMzkuODM0NjI1IDU4Ni42MjA5MTEsMzI5LjUwNzAxOSAKCUM1ODYuNTQ1ODk4LDMyNS41OTgxMTQgNTg3LjY2MzA4NiwzMjMuNDI3NTgyIDU5MS43MDY3ODcsMzIyLjM0NDE0NyAKCUM2MDcuNzY1MTk4LDMxOC4wNDE0NDMgNjIzLjcyMjY1NiwzMTMuMzYyODg1IDYzOS43Njc4ODMsMzA5LjAwOTM5OSAKCUM2NDYuODM3MjgwLDMwNy4wOTEyMTcgNjQ5LjMyNzIwOSwzMDkuMTc2Nzg4IDY0OS4zMjg5MTgsMzE2LjU0MTc3OSAKCUM2NDkuMzQ2NzQxLDM5MS41Mjc2NDkgNjQ5LjM0Mzg3Miw0NjYuNTEzNTE5IDY0OS4zNTU1MzAsNTQxLjQ5OTM5MCAKCUM2NDkuMzU2NTA2LDU0Ny42NzE0NDggNjQ5Ljk4NTcxOCw1NTMuODAxMzkyIDY1MS41OTkyNDMsNTU5Ljc1MDI0NCAKCUM2NTMuMjA2ODQ4LDU2NS42NzcwMDIgNjU1Ljk3NDMwNCw1NjcuNjk0MTUzIDY2Mi4wMzM1MDgsNTY3LjcwNjI5OSAKCUM2NjYuMTc5Njg4LDU2Ny43MTQ2MDAgNjcwLjMxMzIzMiw1NjcuODQ2MTMwIDY3NC40NjE0ODcsNTY2Ljk1MzAwMyAKCUM2NzkuMjIxMjUyLDU2NS45MjgyMjMgNjgxLjI0MDQ3OSw1NjcuNzg1ODg5IDY4MS4zMDQxMzgsNTcyLjc3NjQ4OSAKCUM2ODEuMzkzNDMzLDU3OS43NzQwNDggNjgxLjExNjAyOCw1ODYuNzgyNzc2IDY4MS40MTMwMjUsNTkzLjc2ODk4MiAKCUM2ODEuNjExMjY3LDU5OC40MzE3NjMgNjc5LjQzNDU3MCw2MDAuNzc3NDY2IDY3NS4zOTMxODgsNjAyLjMxMTU4NCAKCUM2NjguNjQwMTk4LDYwNC44NzUwNjEgNjYxLjYyMjk4Niw2MDYuMzgyNDQ2IDY1NC41MDA0ODgsNjA2Ljg4ODI0NSAKCUM2MzcuNjAyNDc4LDYwOC4wODg0NDAgNjIwLjcxODYyOCw2MDguNDcwMTU0IDYwNS45ODQyNTMsNTk3LjkyMTMyNiAKCUM1OTQuNjk5NDYzLDU4OS44NDIyMjQgNTg5LjIzNDE5Miw1NzguNDU0ODk1IDU4Ny42NjEyNTUsNTY0LjkxMTA3MiAKCUM1ODYuNjU5MDU4LDU1Ni4yODE5MjEgNTg2LjcxMzE5Niw1NDcuNjI1NTQ5IDU4Ni43MTE4NTMsNTM4Ljk2NjczNiAKCUM1ODYuNzAyNDU0LDQ3OS44MTExMjcgNTg2LjY5OTQ2Myw0MjAuNjU1NTQ4IDU4Ni42OTQwOTIsMzYwLjk5OTkzOSAKeiIvPgo8cGF0aCBmaWxsPSIjMjU2M2ViIiBvcGFjaXR5PSIxLjAwMDAwMCIgc3Ryb2tlPSJub25lIgoJZD0iCk04MjUuMDk0NzI3LDU4OC4wMzQwNTggCglDODI2LjIxMjA5Nyw1MjcuNDE4NjQwIDgyNS4zOTE0NzksNDY3LjI4Njc3NCA4MjUuNjI5NTc4LDQwNy4xNTgwMjAgCglDODI1LjY2MjEwOSwzOTguOTQzMTQ2IDgyNS44Njc5MjAsMzk4LjczMTI2MiA4MzQuMDU1ODQ3LDM5OC43MjY2MjQgCglDODQ5LjA0ODAzNSwzOTguNzE4MDc5IDg2NC4wNDAyODMsMzk4LjcwMTc1MiA4NzkuMDMyNDEwLDM5OC43MzEzMjMgCglDODg1LjQzNDg3NSwzOTguNzQzOTU4IDg4Ni4zMjE2NTUsMzk5LjYyMjc3MiA4ODYuMzIyODc2LDQwNS45MTI1MzcgCglDODg2LjMzNDkwMCw0NjkuMzc5NDg2IDg4Ni4zMzU1MTAsNTMyLjg0NjQzNiA4ODYuMzI1NDM5LDU5Ni4zMTM0MTYgCglDODg2LjMyNDM0MSw2MDMuMDY4Nzg3IDg4NS4yMzk5MjksNjA0LjE3NTA0OSA4NzguNTEyMzI5LDYwNC4xODk5NDEgCglDODYzLjAyMDUwOCw2MDQuMjI0MzY1IDg0Ny41Mjg1MDMsNjA0LjIzMDEwMyA4MzIuMDM2NzQzLDYwNC4xODU3MzAgCglDODI2LjMzNDU5NSw2MDQuMTY5MzczIDgyNS4wOTY0OTcsNjAyLjgyOTIyNCA4MjUuMDYwMTIwLDU5Ny4wMTg2MTYgCglDODI1LjA0MjM1OCw1OTQuMTg3MDczIDgyNS4wODEyOTksNTkxLjM1NTA0MiA4MjUuMDk0NzI3LDU4OC4wMzQwNTggCnoiLz4KPHBhdGggZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9IgpNODY4LjAyMTI0MCwzMTUuNjIyNzQyIAoJQzg4Ni40NTA1NjIsMzIzLjAzMjU2MiA4OTUuMjcxMjQwLDM0MC4zNTA4MzAgODkwLjE3MDY1NCwzNTguNDM5MDI2IAoJQzg4NS42NjEzMTYsMzc0LjQzMDIwNiA4NjguNjgwNDIwLDM4NS41MTQzNzQgODUyLjUzNTg4OSwzODMuMTYzNjk2IAoJQzgzMC4zODAxODgsMzc5LjkzNzgzNiA4MTguNTg1NTEwLDM2MC44MjAxMjkgODIyLjE3NjY5NywzNDIuNTY4ODE3IAoJQzgyNi41NTQ2MjYsMzIwLjMxODc1NiA4NDUuODkwNDQyLDMwOS4xNDk5MDIgODY4LjAyMTI0MCwzMTUuNjIyNzQyIAp6Ii8+Cjwvc3ZnPg==" alt="Logo Belti" />
        </div>
        <div class="header-info">
            <div class="report-title">Reporte de Solicitudes</div>
            <div class="report-period">Período: {{ $desde }} - {{ $hasta }}</div>
        </div>
    </div>

    <div class="summary-section">
        <div class="summary-title">Resumen del Período</div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Total Solicitudes</th>
                    <th>Pendientes</th>
                    <th>Aprobadas</th>
                    <th>Rechazadas</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <span class="summary-number">{{ $solicitudes->count() }}</span>
                        <span class="summary-label">registros</span>
                    </td>
                    <td>
                        <span class="summary-number" style="color: #e65100;">{{ $solicitudes->where('estado', 'pendiente')->count() }}</span>
                        <span class="summary-label">pendientes</span>
                    </td>
                    <td>
                        <span class="summary-number" style="color: #2e7d32;">{{ $solicitudes->where('estado', 'aprobada')->count() }}</span>
                        <span class="summary-label">aprobadas</span>
                    </td>
                    <td>
                        <span class="summary-number" style="color: #c62828;">{{ $solicitudes->where('estado', 'rechazada')->count() }}</span>
                        <span class="summary-label">rechazadas</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20%;">Empleado</th>
                <th style="width: 12%;">Tipo</th>
                <th style="width: 10%;">Fecha Solicitud</th>
                <th style="width: 10%;">Fecha Inicio</th>
                <th style="width: 10%;">Fecha Fin</th>
                <th style="width: 10%;">Estado</th>
                <th style="width: 28%;">Observaciones</th>
            </tr>
        </thead>
        <tbody>
            @forelse($solicitudes as $solicitud)
                <tr>
                    <td class="employee-name">{{ $solicitud->usuario->nombre ?? 'N/A' }}</td>
                    <td class="type-cell">{{ ucfirst($solicitud->tipo) }}</td>
                    <td class="date-cell">{{ \Carbon\Carbon::parse($solicitud->created_at)->format('d/m/Y') }}</td>
                    <td class="date-cell">{{ $solicitud->fecha_inicio ? \Carbon\Carbon::parse($solicitud->fecha_inicio)->format('d/m/Y') : '-' }}</td>
                    <td class="date-cell">{{ $solicitud->fecha_fin ? \Carbon\Carbon::parse($solicitud->fecha_fin)->format('d/m/Y') : '-' }}</td>
                    <td class="status-cell">
                        <span class="status-badge status-{{ $solicitud->estado }}">
                            {{ ucfirst($solicitud->estado) }}
                        </span>
                    </td>
                    <td>
                        @if($solicitud->motivo_rechazo)
                            <strong>Rechazo:</strong> {{ Str::limit($solicitud->motivo_rechazo, 200) }}
                        @elseif($solicitud->observaciones)
                            {{ Str::limit($solicitud->observaciones, 200) }}
                        @else
                            Sin observaciones
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="no-data">
                        No se encontraron solicitudes para el período seleccionado
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p><strong>Reporte generado el {{ date('d/m/Y') }} a las {{ date('H:i:s') }} por el Sistema de Control Horario BELTI</strong></p>
        <p>Este documento es confidencial y está destinado únicamente para uso interno de la organización</p>
        <p>© {{ date('Y') }} BELTI - Sistema de Control Horario Laboral</p>
    </div>
</body>
</html>