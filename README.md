# lehrpool.NRW

Der Angular-Client wurde mit der Angular CLI in Version 8.3.9 generiert.

## Inbetriebnahme

Nachfolgend werden zwei Möglichkeiten aufgelistet um das Softwarepaket in Betrieb zu nehmen.

Falls Sie genauere Informationen über die Handhabung erhalten möchten, verweisen wir an dieser Stelle auf das [Benutzerhandbuch](https://git.hsrw.eu/niclas.kueppers/lehrpool-nrw/raw/master/Docs/Benutzerhandbuch.pdf), welche sich in unserem Wiki befindet.

### 1. Über eine Virtuelle Maschine
Laden Sie sich die vorkonfigurierte virtuelle Maschine mit Ubuntu 18.04 unter dem folgenden Link herunter und nehmen Sie diese mit der Virtualisierungssoftware VirtualBox in Betrieb: 

https://hochschule-rhein-waal.sciebo.de/s/9nmbCeheLyUwQ7v

Sobald Sie die virtuelle Maschine gestartet haben und diese hochgefahren ist, kann es, je nach Rechenleistung
Ihres Computers, einige Zeit dauern, bis alle Komponenten gestartet werden. Wenn dies
geschehen ist, öffnet sich automatisch der Firefox-Browser in der virtuellen Maschine und Sie können
die Anwendung verwenden.

Sofern Sie sich nicht mit einem der Satelliten-Server der Hochschule, sondern mit einem Testsystem
verbinden wollen, müssen Sie die hinterlegte IP-Adresse manuell ändern. Öffnen Sie dazu
die „tconfig.json”-Datei, welche sich in dem Verzeichnis „/home/student/Dokumente/lehrpool-nrw-
NodeJS” befindet, und ersetzen Sie bei „Testsystem:” die hinterlegte IP-Adresse durch die des Testsystems.
Die IP-Adresse des Testsystems erhalten Sie, sobald Sie dieses mit Vmware-Player starten.
Wenn Sie die IP-Adresse geändert haben, speichern Sie die Datei und starten die virtuelle Maschine
neu. Sobald sich die Anwendung geöffnet hat, können Sie sich mit dem Testsystem verbinden.


### 2. Manuell mit dem Git-Repository
Falls Sie die Anwendung manuell mit Hilfe des Git-Repositorys in Betrieb nehmen wollen, müssen
Sie dazu die verschiedenen Komponenten einzeln herunterladen und starten.

Nachfolgend befinden sich alle Download-Links, welche automatisch die neueste Version des jeweiligen Branch als .zip-Datei herunterladen:
*  Angular-Client: https://git.hsrw.eu/niclas.kueppers/lehrpool-nrw/-/archive/master/lehrpool-nrw-master.zip
*  Node.js-Server: https://git.hsrw.eu/niclas.kueppers/lehrpool-nrw/-/archive/NodeJS/lehrpool-nrw-NodeJS.zip

#### 2.1 Satelliten-Server
Sofern Sie sich nicht mit einem Satelliten-Server der Hochschule, sondern mit einem Testsystem
verbinden wollen, müssen Sie dieses als Erstes starten.
Starten Sie dazu die virtuelle Maschine mit Hilfe von Vmware-Player. Sobald diese hochgefahren
ist, können Sie sich anmelden. Geben Sie dazu bei login „root” und als Passwort ebenfalls „root”
ein. Danach wird Ihnen die IP-Adresse des Satelliten-Servers angezeigt, welche Sie für den Node.js-
Server und den Login benötigen.

#### 2.2 Node.js-Server
Bevor Sie den Node.js-Server starten können, müssen Sie alle benötigten Pakete installieren. Laden Sie
sich dazu als erstes „Node.js” herunter und installieren Sie dieses. Navigieren Sie als nächstes in das
„lehrpool-nrw-NodeJS”-Verzeichnis und öffnen die Konsole. Geben Sie nacheinander die folgenden
Befehle ein:
- npm install express
- npm install node-schedule
- npm install thrift

Sofern sie sich mit dem Testsystem verbinden wollen, öffnen Sie die Datei „tconfig.json”, welche sich
in dem „lehrpool-nrw-NodeJS”-Verzeichnis befindet. Ersetzen Sie bei „Testsystem:” die hinterlegte
IP-Adresse durch die des Testsystems und speichern Sie die Datei.
Sobald Sie den Server starten wollen, geben Sie in der Konsole den Befehl „node index.js” ein.

#### 2.3 Angular-Client
Bevor Sie den Angular-Client starten können, müssen alle benötigten Abhängigkeiten installiert werden.
Öffnen Sie dazu die Konsole und navigieren Sie in das „lehrpool-nrw-master”-Verzeichnis. Geben
Sie als erstes den Befehl „npm install” in die Konsole ein. Sobald alle Pakete heruntergeladen
wurden, geben Sie den Befehl „npm install -g @angular/cli” ein.
Wenn Sie alle Abhängigkeiten erfolgreich heruntergeladen haben, können Sie den Angular-Client
starten, indem Sie in der Konsole den Befehl „ng serve –open” eingeben. Sobald dieser gestartet
wurde, öffnet sich die Anwendung in Ihrem Standardbrowser.