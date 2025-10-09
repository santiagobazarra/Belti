<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Solicitudes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            background: #fff;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }

        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #2563eb;
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .report-title {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
        }

        .report-period {
            font-size: 12px;
            color: #888;
        }

        .info-section {
            margin-bottom: 25px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #2563eb;
        }

        .info-title {
            font-size: 13px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .info-item {
            text-align: center;
        }

        .info-number {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            display: block;
        }

        .info-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }

        .data-table th {
            background: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 10px;
            color: #333;
        }

        .data-table tr:nth-child(even) {
            background: #f9f9f9;
        }

        .data-table tr:hover {
            background: #f0f8ff;
        }

        .status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-aprobada {
            background: #d4edda;
            color: #155724;
        }

        .status-pendiente {
            background: #fff3cd;
            color: #856404;
        }

        .status-rechazada {
            background: #f8d7da;
            color: #721c24;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 9px;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }

        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .header {
                margin-bottom: 20px;
            }
            
            .data-table {
                font-size: 9px;
            }
            
            .data-table th,
            .data-table td {
                padding: 8px 6px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo">
            <img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMTAwJSIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAyNCAxMDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHA+ZmlsbD0iIzI1NjNlZiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik0xMzYuNjY2NDQzLDMyMi4yMzY1NzIgCglDMTM2LjI3MTY2NywzMTcuMzQxNzY2IDEzOC42ODA0NjYsMzE1LjgyOTY1MSAxNDIuNjk1NjAyLDMxNS44MzQ3MTcgCglDMTc2Ljg0OTkzMCwzMTUuODc3NjU1IDIxMS4wMTE4NTYsMzE1LjQ3NjEzNSAyNDUuMTU1NzkyLDMxNi4wODY0NTYgCglDMjY1LjUzNjAxMSwzMTYuNDUwNzQ1IDI4NS42Nzg2ODAsMzE5LjM3ODI2NSAzMDMuNjc0ODM1LDMzMC4xODgyOTMgCglDMzIzLjg3MzI2MCwzNDIuMzIxMjU5IDMzNC42MTQ0NzEsMzU5LjkxMjE3MCAzMzUuNDcyNDczLDM4My44MjI4NzYgCglDMzM2LjUxNTk2MSw0MTIuOTAyOTI0IDMyMy45NzIxNjgsNDMzLjY0MDkwMCAyOTguNzY2NjkzLDQ0Ny4zMjE1MDMgCglDMjk3LjA4MjQ1OCw0NDguMjM1NjU3IDI5NC41NzE3MTYsNDQ4LjczMjk0MSAyOTQuNTY1MjE2LDQ1MS4xMTU3NTMgCglDMjk0LjU1Nzk4Myw0NTMuNzY5NzE0IDI5Ny4zNDcyNjAsNDUzLjY4OTE0OCAyOTkuMDQzOTc2LDQ1NC4zNDI3NzMgCglDMzA4Ljg4MTM0OCw0NTguMTMyNjYwIDMxOC4zNjEyMDYsNDYyLjU5MjQ5OSAzMjYuNzQxMTUwLDQ2OS4wNjEwNjYgCglDMzQxLjc5NDU1Niw0ODAuNjgxMDAwIDM0OC43MzQ1ODksNDk2LjQzODMyNCAzNTAuNDAzMzgxLDUxNS4wNzQwMzYgCglDMzUyLjI1MzUxMCw1MzUuNzM0ODYzIDM0Ny41Mzk2MTIsNTU0LjM5NTkzNSAzMzQuNDMyMjIwLDU3MC42MjY3MDkgCglDMzIyLjg2MDc0OCw1ODQuOTU1NTA1IDMwNy43NDI1MjMsNTk0LjAwODYwNiAyOTAuMjYzNDU4LDU5OS4yNzE3OTAgCglDMjc2LjQ4NzQ1Nyw2MDMuNDE5OTIyIDI2Mi40NTk0NzMsNjA1LjU1NjI3NCAyNDcuOTgwMTMzLDYwNS40NDc5MzcgCglDMjEzLjMyNzQyMyw2MDUuMTg4NTk5IDE3OC42NzE0MzIsNjA1LjM3NDUxMiAxNDQuMDE2NzU0LDYwNS4zNjc3OTggCglDMTM2Ljk4MzA3OCw2MDUuMzY2NDU1IDEzNi42NDkwNjMsNjA1LjAxNjYwMiAxMzYuNjIzMDc3LDU5OC4wNDQwNjcgCglDMTM2LjQ1MzAxOCw1NTIuMzk4NjgyIDEzNi4xNDkyMDAsNTA2Ljc1MzIzNSAxMzYuMTU3MDI4LDQ2MS4xMDc4ODAgCglDMTM2LjE2NDkzMiw0MTQuOTc0ODU0IDEzNi40ODI2OTcsMzY4Ljg0MTg1OCAxMzYuNjY2NDQzLDMyMi4yMzY1NzIgCk0yMDMuNjc3OTE3LDQ3My45Mzk2MzYgCglDMjAxLjUxMjQwNSw0NzUuMDE1OTMwIDIwMS4zNDU4MjUsNDc3LjAzNTMwOSAyMDEuMzQwNzc1LDQ3OS4wNjc1OTYgCglDMjAxLjI3MTY1Miw1MDYuODg4NTgwIDIwMS4yNDI4NDQsNTM0LjcwOTY1NiAyMDEuMTM0MDc5LDU2Mi41MzA0NTcgCglDMjAxLjEyMjQ2Nyw1NjUuNDk0NjkwIDIwMi4yMzIzMDAsNTY2LjcyNTUyNSAyMDUuMjQ0NDE1LDU2Ni43MDUwMTcgCglDMjE4LjcwODQzNSw1NjYuNjEzMTU5IDIzMi4xOTgwMTMsNTY3LjI4NTUyMiAyNDUuNTM5NTIwLDU2NC42NDIwOTAgCglDMjU3LjQ1NTkwMiw1NjIuMjgxMDA2IDI2OC4yNzI2NzUsNTU3LjkwNjY3NyAyNzUuNjkwNTIxLDU0Ny43MjAzOTggCglDMjk0LjY4NDcyMyw1MjEuNjM3MzkwIDI4MS43NTE1ODcsNDg1LjE0ODQ5OSAyNTAuNTk2Mjk4LDQ3Ni4zODg5NzcgCglDMjM1LjM4ODAxNiw0NzIuMTEzMDM3IDIxOS45MDk1MTUsNDczLjM4ODg4NSAyMDMuNjc3OTE3LDQ3My45Mzk2MzYgCk0yNTEuODgxNTQ2LDM1OS41ODcxODkgCglDMjUxLjI5NjE3MywzNTkuMjY5NzE0IDI1MC43MTQ1ODQsMzU4Ljk0NTA2OCAyNTAuMTI0ODQ3LDM1OC42MzU4OTUgCglDMjM1LjkzNDk5OCwzNTEuMTk2Nzc3IDIyMC41ODk0MTcsMzUzLjUzNjA3MiAyMDUuNTQ2NDQ4LDM1My40MzkzMzEgCglDMjAyLjczNDg3OSwzNTMuNDIxMjY1IDIwMi4xNjk3MzksMzU1LjYxNTU0MCAyMDIuMTE2MTk2LDM1OC4wMDQ3MzAgCglDMjAxLjk4NTcwMywzNjMuODI3Njk4IDIwMS42OTg3MzAsMzY5LjY0ODY1MSAyMDEuNjU1NTYzLDM3NS40NzE4MDIgCglDMjAxLjUxNjA5OCwzOTQuMjgwODIzIDIwMS40NDc2OTMsNDEzLjA5MDQyNCAyMDEuMzgwNzUzLDQzMS44OTk5MDIgCglDMjAxLjM3MTM1Myw0MzQuNTM4NDIyIDIwMi4zOTI3OTIsNDM2LjU5NjIyMiAyMDUuMzcxNzk2LDQzNi41ODM2NzkgCglDMjE2LjY2MzQyMiw0MzYuNTM2MTMzIDIyOC4wNDExNTMsNDM3LjYwNDM3MCAyMzkuMTkyMTIzLDQzNS4xNTk4MjEgCglDMjU3LjQ0MzU0Miw0MzEuMTU4NzUyIDI2Ny45Mjk0NDMsNDE4LjczMTY1OSAyNjkuNTA2MjU2LDM5OS4xOTMzMjkgCglDMjcwLjc5NzMzMywzODMuMTk1MTkwIDI2Ny41OTY5NTQsMzY4Ljk1NzEyMyAyNTEuODgxNTQ2LDM1OS41ODcxODkgCnoiLz4KPHA+ZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik01NTcuMzQ5MDYwLDU2Ni45OTg1MzUgCglDNTU3LjM0OTA2MCw1NjkuODMwNTA1IDU1Ny4wMDM2NjIsNTcyLjIyNTE1OSA1NTcuNDEwNDYxLDU3NC40ODQzMTQgCglDNTU4Ljg5Mjk0NCw1ODIuNzE2OTgwIDU1NS4wMTA2MjAsNTg3LjA2NDQ1MyA1NDcuOTExNTYwLDU5MC43MTkxMTYgCglDNTI4LjAyMzgwNCw2MDAuOTU3NjQyIDUwNy4xMDk4NjMsNjA2LjcxNDY2MSA0ODQuNzcxMTQ5LDYwNy4zMjM2MDggCglDNDY5LjQxMTI4NSw2MDcuNzQyMjQ5IDQ1NC4xMTk5OTUsNjA3LjA2MDU0NyA0MzkuMjkxMjI5LDYwMi42NTkxMTkgCglDNDAxLjU5NTE4NCw1OTEuNDcwMzk4IDM3Ny44OTgwNzEsNTY2LjcyMTA2OSAzNzAuMTAxMDc0LDUyOC4xNDcyNzggCglDMzYzLjQyMjU0Niw0OTUuMTA2NzIwIDM2OC4xMjQ0ODEsNDYzLjQ1ODE2MCAzODcuMDU1ODE3LDQzNC45NTYyMzggCglDNDAzLjYzNDMwOCw0MDkuOTk2NDkwIDQyNy4yOTIyOTcsMzk1Ljg5Mjg4MyA0NTYuOTM1OTEzLDM5MS41MzkzMDcgCglDNDc1LjMxNTU4MiwzODguODM5OTk2IDQ5My4zNjA5MzEsMzg5LjU3MDgzMSA1MTEuMDk3MjkwLDM5NS4zNzI0MDYgCglDNTEzNC41NTk3NTMsNDAzLjA0NjkwNiA1NDkuOTg1NDEzLDQxOC44MTUxMjUgNTU4LjU4ODk4OSw0NDEuODAwNTY4IAoJQzU2Ni4xMzc4NzgsNDYxLjk2ODIwMSA1NjUuNTY4MjM3LDQ4Mi45MTExMDIgNTY1LjI5MjY2NCw1MDMuODY1OTA2IAoJQzU2NS4yNTUzNzEsNTA2LjcwMzUyMiA1NjMuNTAzMjk2LDUwOC4wMjY3OTQgNTYwLjgwNTU0Miw1MDguMTk4MDU5IAoJQzU1OS40NzcyMzQsNTA4LjI4MjMxOCA1NTguMTQxMjM1LDUwOC4yNjE4MTAgNTU2LjgwODcxNiw1MDguMjYxNTk3IAoJQzUxNy45ODk2ODUsNTA4LjI1NTUyNCA0NzkuMTcwNjI0LDUwOC4yNTA2MTAgNDQwLjM1MTU2Miw1MDguMjMzODI2IAoJQzQzMS4xNzE4MTQsNTA4LjIyOTg1OCA0MzAuNTQ1MTA1LDUwOS4wNjk5NzcgNDMyLjIwOTc0Nyw1MTguMDM1ODg5IAoJQzQzMy43ODM3NTIsNTI2LjUxMzczMyA0MzYuODg0NTgzLDUzNC4yOTk5MjcgNDQxLjgzNDEzNyw1NDEuMzY4ODM1IAoJQzQ1MS45NjU0NTQsNTU1LjgzODI1NyA0NjYuNDE0OTQ4LDU2Mi4zMzk3MjIgNDgzLjQ5ODM1Miw1NjMuNjE0NjI0IAoJQzUwNi42NjE5NTcsNTY1LjM0MzE0MCA1MjcuNDM0MjA0LDU1OC4wMjQzNTMgNTQ2LjkyMDM0OSw1NDYuMTg5NTc1IAoJQzU0OC4wNTkyNjUsNTQ1LjQ5Nzg2NCA1NDkuMTg3NjIyLDU0NC43ODQ4NTEgNTUwLjM1NjIwMSw1NDQuMTQ2MzYyIAoJQzU1NS4xMzU4MDMsNTQxLjUzNDcyOSA1NTcuMjE2MTg3LDU0Mi42Mzg3OTQgNTU3LjMxMjc0NCw1NDguMDA2NjUzIAoJQzU1Ny40MjM1MjMsNTU0LjE2OTAwNiA1NTcuMzQ1MDMyLDU2MC4zMzQ3NzggNTU3LjM0OTA2MCw1NjYuOTk4NTM1IAoJTTQ2My40OTk5MzksNDc0LjY0MzA2NiAKCUM0NzUuOTg3MjEzLDQ3NC42MzI5NjUgNDg4LjQ3NjI4OCw0NzQuNTAwNDg4IDUwMC45NjA3ODUsNDc0LjY4MjM0MyAKCUM1MDUuMDYzMTQxLDQ3NC43NDIwNjUgNTA2Ljk3ODg1MSw0NzMuMjM3NTE4IDUwNi42MDQ0OTIsNDY5LjE5NjA0NSAKCUM1MDUuNDE0MzY4LDQ1Ni4zNDgyMDYgNTAyLjAzOTY3Myw0NDQuMzIyNTcxIDQ5Mi44NzcwNzUsNDM0LjY1OTA4OCAKCUM0ODIuOTMxOTE1LDQyNC4xNzAyNTggNDY3Ljg2MjM5Niw0MjEuNzYwOTg2IDQ1NS4zODU1OTAsNDI5LjAzNDUxNSAKCUM0MzkuNTE1Nzc4LDQzOC4yODYxMDIgNDM0LjE2MzI2OSw0NTMuODMxODc5IDQzMS4zNjkxMTAsNDcwLjcyMzQxOSAKCUM0MzAuODM5MTExLDQ3My45Mjc1NTEgNDMyLjcwNTI2MSw0NzQuNjc5NDEzIDQzNS41Mjc2MTgsNDc0LjY1NDU3MiAKCUM0NDQuNTE3NzAwLDQ3NC41NzU0MDkgNDUzLjUwOTA2NCw0NzQuNjM1NTkwIDQ2My40OTk5MzksNDc0LjY0MzA2NiAKCnoiLz4KPHA+ZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik00MzguMzI3MzAxLDY0MC45ODg0MDMgCglDNDcxLjYzOTU4Nyw2MzguNjE3NjE1IDUwNC41MTU5MzAsNjM2Ljc4NjY4MiA1MzcuNDM4MDQ5LDYzNS40MDUzOTYgCglDNTg5Ljc0NzMxNCw2MzMuMjEwNTcxIDY0Mi4wNTI0OTAsNjMzLjQ2MzEzNSA2OTQuMzYxMDg0LDYzMy45NjM2MjMgCglDNzIxLjE1NTgyMyw2MzQuMjE5OTEwIDc0Ny45NTM3MzUsNjM1LjQ5MTIxMSA3NzQuNzIxMDA4LDYzNi44NzA0ODMgCglDNzk4LjQ2NTgyMCw2MzguMDkzOTk0IDgyMi4xODM0MTEsNjM5LjkzNTk3NCA4NDUuODg2ODQxLDY0MS44MzMwNjkgCglDODU3LjMwNDk5Myw2NDIuNzQ2OTQ4IDg2OC42NjYwNzcsNjQ0LjM4NzU3MyA4ODAuMDQ0ODAwLDY0NS43NjcwOTAgCglDODgyLjM2NjI3Miw2NDYuMDQ4NTg0IDg4NC42OTQ2NDEsNjQ2LjYwMjg0NCA4ODYuMjA4Mzc0LDY0OC42NDgzMTUgCglDODg3Ljc0MjMxMCw2NTAuNzIxMTkxIDg4Ny42OTI0NDQsNjUzLjAzMzM4NiA4ODYuNzMzMTU0LDY1NS4yODY5MjYgCglDODg1LjU4NDkwMCw2NTcuOTg0MjUzIDg4My4yNDI2NzYsNjU4LjY4MzQ3MiA4ODAuNTUyMDAyLDY1OC41MTgzNzIgCglDODY0LjkzNzUwMCw2NTcuNTYwMzAzIDg0OS4zMzE3MjYsNjU2LjQyOTY4OCA4MzMuNzA3OTQ3LDY1NS42NjQwNjIgCglDODIwLjg5OTEwOSw2NTUuMDM2Mzc3IDgwOC4wNzE3MTYsNjU0LjY1NTY0MCA3OTUuMjQ4MjkxLDY1NC40ODEwNzkgCglDNzYxLjc1ODE4LDY1NC4wMjUzMzAgNzI4LjI3OTcyNCw2NTQuNjMwMDA1IDY5NC44MTY4OTUsNjU2LjA1NzA2OCAKCUM2NzcuMzUwMTU5LDY1Ni44MDIwMDIgNjU5Ljg3NTI0NCw2NTcuNDA2NTU1IDY0Mi40MjA4MzcsNjU4LjM3NjY0OCAKCUM2MjIuODI4OTc5LDY1OS40NjU0NTQgNjAzLjI3Nzk1NCw2NjEuMTA3MTc4IDU4My43NDMyMjUsNjYzLjAzMTk4MiAKCUM1NjUuMjE1NDU0LDY2NC44NTc2NjYgNTQ2LjcyODg4Miw2NjYuOTgxMTQwIDUyOC4yNDQxNDEsNjY5LjE3MzQ2MiAKCUM1MDkuMjY3NjA5LDY3MS40MjQxOTQgNDkwLjM5MTUxMCw2NzQuMzM0MTY3IDQ3MS40ODk5OTAsNjc3LjExMDQxMyAKCUM0MzEuMDM1OTgwLDY4My4wNTIxMjQgMzkwLjg5OTY1OCw2OTAuNjg1MzAzIDM1MS4wMDMxNDMsNjk5LjU0NzU0NiAKCUMzMTIuMzQ2NjQ5LDcwOC4xMzQzOTkgMjc0LjE4MTQ1OCw3MTguNjUxNjcyIDIzNi4xNDUxNTcsNzI5LjY1MTczMyAKCUMyMjcuNTQ3NDg1LDczMi4xMzgxMjMgMjE4Ljk1NDY1MSw3MzQuNzA3MDkyIDIwOS45NDMyMDcsNzM1Ljc0MzQ2OSAKCUMxOTcuNzQxMjI2LDczNy4xNDY3MjkgMTg2LjM1NDIwMiw3MzUuMTc2MjcwIDE3NS44MTA0NTUsNzI4Ljk5MTYzOCAKCUMxNjIuNjcwNjM5LDcyMS4yODQyNDEgMTUxLjk3ODc5MCw3MTAuODkwOTMwIDE0My4zNjE5ODQsNjk4LjM1MjI5NSAKCUMxNDIuNTE0ODYyLDY5Ny4xMTk1NjggMTQxLjc1MjAyOSw2OTUuODE2NTg5IDE0MS4wNzA4MzEsNjk0LjQ4NDM3NSAKCUMxMzguMDAzMjIwLDY4OC40ODUwNDYgMTM5LjM2NzcyMiw2ODUuMzIwMTI5IDE0NS44MDgxOTcsNjg0LjAyMjI3OCAKCUMxNTguMzQ1MTIzLDY4MS40OTU5MTEgMTcwLjg5NTQzMiw2NzkuMDI4ODA5IDE4My40NzAxMjMsNjc2LjY5ODczMCAKCUMxMDYuNjUxMDc3LDY3Mi40MDMzMjAgMjI5Ljc5NjUwOSw2NjcuODcyOTI1IDI1My4wNjI2MDcsNjY0LjA5MTkxOSAKCUMxNzguNDU1MjYxLDY1OS45NjUyNzEgMzAzLjgxMzA0OSw2NTUuNTQ4MDk2IDMyOS4zODkwMzgsNjUyLjYwMTI1NyAKCUMzNTEuNDkwNzIzLDY1MC4wNTQ4MTAgMzczLjU2MzY5MCw2NDcuMjUwOTE2IDM5NS42ODA1NDIsNjQ0Ljg0NzUzNCAKCUM0MDkuNzE2Njc1LDY0My4zMjIzMjcgNDIzLjgwOTc1Myw2NDIuMzIxNTk0IDQzOC4zMjczMDEsNjQwLjk4ODQwMyAKCnoiLz4KPHA+ZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik04MDYuNTYwOTEzLDQwMC43NTI0NzIgCglDODA3LjkwMTYxMSw0MTEuNTg5ODQ0IDgwNy4yNjExMDgsNDIyLjA3ODMwOCA4MDcuMTcxMjA0LDQzMi41NTE0NTMgCglDODA3LjEzNzc1Niw0MzYuNDUxMTQxIDgwNC4wMjk5MDcsNDM3LjE4NjQ5MyA4MDAuNzQzOTU4LDQzNy4xOTI3NDkgCglDNzg5LjU4MDU2Niw0MzcuMjE0MDUwIDc3OC40MTcxMTQsNDM3LjI1NDUxNyA3NjcuMjUzNzIzLDQzNy4yODgzNjEgCglDNzYwLjM2OTAxOSw0MzcuMzA5MjA0IDc2MC4zNTgwMzIsNDM3LjMwOTc1MyA3NjAuMzU2MjAxLDQ0NC4yMDg1NTcgCglDNzYwLjM0ODc1NSw0NzIuNzAwNTMxIDc2MC40MTA3MDYsNTAxLjE5MjgxMCA3NjAuMjg3MjMxLDUyOS42ODQyNjUgCglDNzYwLjI2NTQ0Miw1MzQuNzExNzkyIDc2MC43NjI5MzksNTM5LjY2MDA5NSA3NjEuNDc3NTM5LDU0NC41ODE2MDQgCglDNzYzLjAxMTQ3NSw1NTUuMTQ1OTM1IDc3Mi41OTgwODMsNTYzLjQwNzEwNCA3ODMuMzA5MjY1LDU2My43MzIyMzkgCglDNzg5LjMxOTI3NSw1NjMuOTE0NjEyIDc5NS4yNjQ1ODcsNTYzLjU4MTYwNCA4MDEuMTMwMzcxLDU2Mi4wODcyODAgCglDODA1LjA3NzYzNyw1NjEuMDgxNjY1IDgwNy4yOTUxMDUsNTYyLjY5MzQyMCA4MDcuMzEyMTk1LDU2Ni44NTc3ODggCglDODA3LjM0ODQ1MCw1NzUuNjg4MzU0IDgwNy4yOTU2NTQsNTg0LjUxOTM0OCA4MDcuMzM2MDYwLDU5My4zNDk5MTUgCglDODA3LjM1MjcyMiw1OTYuOTkyOTgxIDgwNS4wMTY2NjMsNTk4LjU3MDM3NCA4MDIuMTAyNzgzLDU5OS44NDcwNDYgCglDNzg1LjMwNTcyNSw2MDcuMjA2NTQzIDc2Ny42OTYxMDYsNjA4LjQxMjA0OCA3NDkuNzI2MTM1LDYwNi43NTgyNDAgCglDNzM5LjYxMDA0Niw2MDUuODI3MzMyIDczMC4yMTc4OTYsNjAyLjcwNzU4MSA3MjEuNzM0OTg1LDU5Ny4wMTQxNjAgCglDNzA4LjYxOTY5MCw1ODguMjExNzMxIDcwMS44MzQ1MzQsNTc1LjQ5NjIxNiA3MDAuNzY1Njg2LDU2MC4xNjMzMzAgCglDNjk4LjE0NTM4Niw1MjIuNTc2Mjk0IDcwMC4yNzkyMzYsNDg0LjkxMDcwNiA2OTkuNjYwNDYxLDQ0Ny4yODQwNTggCglDNjk5LjYzNTgwMyw0NDUuNzg0ODUxIDY5OS41MjQ3MTksNDQ0LjI3MTk3MyA2OTkuNjc1NDE1LDQ0Mi43ODc5MDMgCglDNzAwLjA4MzE5MSw0MzguNzcwOTY2IDY5OC41ODU3NTQsNDM3LjA0OTg2NiA2OTQuMzMzOTg0LDQzNy4yMzgyMjAgCglDNjg3Ljg0ODE0NSw0MzcuNTI1NTEzIDY4MS4zMzczNDEsNDM3LjIwOTAxNSA2NzQuODQ0OTEwLDQzNy40MDU2MDkgCglDNzA5Ljk5ODQ3NCw0MzcuNTIyMDk1IDY2OS40MTIyOTIsNDM2LjEyNTczMiA2NjkuNTAwNTQ5LDQzMi4xNjkyMjAgCglDNjY5LjcwNTEzOSw0MjMuMDA5MjQ3IDY2OS43MzYzODksNDEzLjg0MTA2NCA2NjkuNjAwNzY5LDQwNC42Nzk3MTggCglDNjY5LjUzNzU5OCw0MDAuNDA1ODIzIDY3MS4yNjk1OTIsMzk4LjU5OTA2MCA2NzUuNTE4NzM4LDM5OC42ODE3MzIgCglDNjgyLjAxNDM0MywzOTguODA4MDc1IDY4OC41MTY5NjgsMzk4LjU5NDA1NSA2OTUuMDExNDc1LDM5OC43NDU3ODkgCglDNjk4LjQ3ODk0MywzOTguODI2NzgyIDY5OS43MzAxMDMsMzk3LjQzMDkwOCA2OTkuNjg3MTk1LDM5NC4wMTcwNTkgCglDNjk5LjU1NzM3MywzODMuNjg4MjAyIDY5OS43NTQwMjgsMzczLjM1NDQzMSA2OTkuNTU0NDQzLDM2My4wMjc3NDAgCglDNjk5LjQ4ODc3MCwzNTkuNjMzMzkyIDcwMC42NDIwOTAsMzU3LjkxNTEzMSA3MDMuODcyMTkyLDM1Ni44NjQ0NDEgCglDNzIwLjE3MTU3MCwzNTEuNTYyNjIyIDczNi40MDEzMDYsMzQ2LjA0NzA4OSA3NTIuNjg0OTk4LDM0MC42OTYzODEgCglDNzU4LjQyNDU2MSwzMzguODEwNDI1IDc2MC4zMjQyMTksMzQwLjI3ODc3OCA3NjAuMzM3MTU4LDM0Ni40MTI3NTAgCglDNzYwLjM2OTgxMiwzNjEuOTA4MzI1IDc2MC41MzYzMTYsMzc3LjQwNzU5MyA3NjAuMjM4MTU5LDM5Mi44OTc0OTEgCglDNzYwLjE0NTc1MiwzOTcuNjk5NDkzIDc2MS44NzczODAsMzk4Ljg2MDIyOSA3NjYuMjg5MTI0LDM5OC43Njk0MDkgCglDNzc3LjQ0NzkzNywzOTguNTM5NzM0IDc4OC42MTQ1NjMsMzk4LjY4ODkwNCA3OTkuNzc4MDc2LDM5OC42ODk1NDUgCglDODAyLjA5NTcwMywzOTguNjg5Njk3IDgwNC41MDEzNDMsMzk4LjM2MzcwOCA4MDYuNTYwOTEzLDQwMC43NTI0NzIgCnoiLz4KPHA+ZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik01ODYuNjk0MDkyLDM2MC45OTk5MzkgCglDNTg2LjY5MTY1MCwzNTAuMTY4NTE4IDU4Ni44MTkyMTQsMzM5LjgzNDYyNSA1ODYuNjIwOTExLDMyOS41MDcwMTkgCglDNTg2LjU0NTg5OCwzMjUuNTk4MTE0IDU4Ny42NjMwODYsMzIzLjQyNzU4MiA1OTEuNzA2Nzg3LDMyMi4zNDQxNDcgCglDNjA3Ljc2NTE5OCwzMTguMDQxNDQzIDYyMy43MjI2NTYsMzEzLjM2Mjg4NSA2MzkuNzY3ODgzLDMwOS4wMDkzOTkgCglDNjQ2LjgzNzI4MCwzMDcuMDkxMjE3IDY0OS4zMjcyMDksMzA5LjE3Njc4OCA2NDkuMzI4OTE4LDMxNi41NDE3NzkgCglDNjQ5LjM0Njc0MSwzOTEuNTI3NjQ5IDY0OS4zNDM4NzIsNDY2LjUxMzUxOSA2NDkuMzU1NTMwLDU0MS40OTkzOTAgCglDNjQ5LjM1NjUwNiw1NDcuNjcxNDQ4IDY0OS45ODU3MTgsNTUzLjgwMTM5MiA2NTEuNTk5MjQzLDU1OS43NTAyNDQgCglDNjUzLjIwNjg0OCw1NjUuNjc3MDAyIDY1NS45NzQzMDQsNTY3LjY5NDE1MyA2NjIuMDMzNTA4LDU2Ny43MDYyOTkgCglDNjY2LjE3OTY4OCw1NjcuNzE0NjAwIDY3MC4zMTMyMzIsNTY3Ljg0NjEzMCA2NzQuNDYxNDg3LDU2Ni45NTMwMDMgCglDNjc5LjIyMTI1Miw1NjUuOTI4MjIzIDY4MS4yNDA0NzksNTY3Ljc4NTg4OSA2ODEuMzA0MTM4LDU3Mi43NzY0ODkgCglDNjgxLjM5MzQzMyw1NzkuNzc0MDQ4IDY4MS4xMTYwMjgsNTg2Ljc4Mjc3NiA2ODEuNDEzMDI1LDU5My43Njg5ODIgCglDNjgxLjYxMTI2Nyw1OTguNDMxNzYzIDY3OS40MzQ1NzAsNjAwLjc3NzQ2NiA2NzUuMzkzMTg4LDYwMi4zMTE1ODQgCglDNjY4LjY0MDE5OCw2MDQuODc1MDYxIDY2MS42MjI5ODYsNjA2LjM4MjQ0NiA2NTQuNTAwNDg4LDYwNi44ODgyNDUgCglDNjM3LjYwMjQ3OCw2MDguMDg4NDQwIDYyMC43MTg2MjgsNjA4LjQ3MDE1NCA2MDUuOTg0MjUzLDU5Ny45MjEzMjYgCglDNjk0LjY5OTQ2Myw1ODkuODQyMjI0IDU4OS4yMzQxOTIsNTc4LjQ1NDg5NSA1ODcuNjYxMjU1LDU2NC45MTEwNzIgCglDNTg2LjY1OTA1OCw1NTYuMjgxOTIxIDU4Ni43MTMxOTYsNTQ3LjYyNTU0OSA1ODYuNzExODUzLDUzOC45NjY3MzYgCglDNTg2LjcwMjQ1NCw0NzkuODExMTI3IDU4Ni42OTk0NjMsNDIwLjY1NTU0OCA1ODYuNjk0MDkyLDM2MC45OTk5MzkgCnoiLz4KPHA+ZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik04MjUuMDk0NzI3LDU4OC4wMzQwNTggCglDODI2LjIxMjA5Nyw1MjcuNDE4NjQwIDgyNS4zOTE0NzksNDY3LjI4Njc3NCA4MjUuNjI5NTc4LDQwNy4xNTgwMjAgCglDODI1LjY2MjEwOSwzOTguOTQzMTQ2IDgyNS44Njc5MjAsMzk4LjczMTI2MiA4MzQuMDU1ODQ3LDM5OC43MjY2MjQgCglDODQ5LjA0ODAzNSwzOTguNzE4MDc5IDg2NC4wNDAyODMsMzk4LjcwMTc1MiA4NzkuMDMyNDEwLDM5OC43MzEzMjMgCglDODg1LjQzNDg3NSwzOTguNzQzOTU4IDg4Ni4zMjE2NTUsMzk5LjYyMjc3MiA4ODYuMzIyODc2LDQwNS45MTI1MzcgCglDODg2LjMzNDkwMCw0NjkuMzc5NDg2IDg4Ni4zMzU1MTAsNTMyLjg0NjQzNiA4ODYuMzI1NDM5LDU5Ni4zMTM0MTYgCglDODg2LjMyNDM0MSw2MDMuMDY4Nzg3IDg4NS4yMzk5MjksNjA0LjE3NTA0OSA4NzguNTEyMzI5LDYwNC4xODk5NDEgCglDODYzLjAyMDUwOCw2MDQuMjI0MzY1IDg0Ny41Mjg1MDMsNjA0LjIzMDEwMyA4MzIuMDM2NzQzLDYwNC4xODU3MzAgCglDODI2LjMzNDU5NSw2MDQuMTY5MzczIDgyNS4wOTY0OTcsNjAyLjgyOTIyNCA4MjUuMDYwMTIwLDU5Ny4wMTg2MTYgCglDODI1LjA0MjM1OCw1OTQuMTg3MDczIDgyNS4wODEyOTksNTkxLjM1NTA0MiA4MjUuMDk0NzI3LDU4OC4wMzQwNTggCnoiLz4KPHA+ZmlsbD0iIzI1NjNlYiIgb3BhY2l0eT0iMS4wMDAwMDAiIHN0cm9rZT0ibm9uZSIKCWQ9Ik04NjguMDIxMjQwLDMxNS42MjI3NDIgCglDODg2LjQ1MDU2MiwzMjMuMDMyNTYyIDg5NS4yNzEyNDAsMzQwLjM1MDgzMCA4OTAuMTcwNjU0LDM1OC40MzkwMjYgCglDODg1LjY2MTMxNiwzNzQuNDMwMjA2IDg2OC42ODA0MjAsMzg1LjUxNDM3NCA4NTIuNTM1ODg5LDM4My4xNjM2OTYgCglDODMwLjM4MDE4OCwzNzkuOTM3ODM2IDgxOC41ODU1MTAsMzYwLjgyMDEyOSA4MjIuMTc2Njk3LDM0Mi41Njg4MTcgCglDODI2LjU1NDYyNiwzMjAuMzE4NzU2IDg0NS44OTA0NDIsMzA5LjE0OTkwMiA4NjguMDIxMjQwLDMxNS42MjI3NDIgCnoiLz4KPC9zdmc+" alt="Logo Belti" />
        </div>
        <div class="company-name">BELTI</div>
        <div class="report-title">Reporte de Solicitudes</div>
        <div class="report-period">Período: {{ $desde }} - {{ $hasta }}</div>
    </div>

    <!-- Summary Information -->
    <div class="info-section">
        <div class="info-title">Resumen del Reporte</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-number">{{ $solicitudes->count() }}</span>
                <span class="info-label">Total Solicitudes</span>
            </div>
            <div class="info-item">
                <span class="info-number">{{ $solicitudes->where('estado', 'aprobada')->count() }}</span>
                <span class="info-label">Aprobadas</span>
            </div>
            <div class="info-item">
                <span class="info-number">{{ $solicitudes->where('estado', 'pendiente')->count() }}</span>
                <span class="info-label">Pendientes</span>
            </div>
            <div class="info-item">
                <span class="info-number">{{ $solicitudes->where('estado', 'rechazada')->count() }}</span>
                <span class="info-label">Rechazadas</span>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 18%;">Empleado</th>
                <th style="width: 12%;">Tipo</th>
                <th style="width: 12%;">Fecha Solicitud</th>
                <th style="width: 12%;">Fecha Inicio</th>
                <th style="width: 12%;">Fecha Fin</th>
                <th style="width: 10%;">Estado</th>
                <th style="width: 24%;">Motivo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($solicitudes as $solicitud)
                <tr>
                    <td>{{ $solicitud->usuario->nombre ?? 'N/A' }}</td>
                    <td>{{ ucfirst($solicitud->tipo) }}</td>
                    <td>{{ \Carbon\Carbon::parse($solicitud->created_at)->format('d/m/Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($solicitud->fecha_inicio)->format('d/m/Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($solicitud->fecha_fin)->format('d/m/Y') }}</td>
                    <td>
                        <span class="status-badge status-{{ $solicitud->estado }}">
                            {{ ucfirst($solicitud->estado) }}
                        </span>
                    </td>
                    <td>{{ Str::limit($solicitud->motivo, 50) }}</td>
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

    <!-- Footer -->
    <div class="footer">
        <p>Reporte generado el {{ date('d/m/Y H:i:s') }} por el Sistema de Control Horario Belti</p>
        <p>Este documento es confidencial y está destinado únicamente para uso interno</p>
    </div>
</body>
</html>