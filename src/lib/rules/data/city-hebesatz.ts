/**
 * Per-city Gewerbesteuer-Hebesatz, copied verbatim from the legacy CITIES array
 * in index.html (246 entries; "Erlangen" appears twice with the same value, the
 * Map in cities.ts deduplicates it).
 *
 * The one city in cities246.json without an entry here ("Nörenberg") falls back
 * to the nationwide average (400 %); cities.ts logs that in development.
 *
 * Keys are unquoted on purpose — valid TypeScript, kept 1:1 with the legacy data.
 */

type CityHebesatz = {
    n: string;
    hb: number;
};

const cityHebesatzList: CityHebesatz[] = [
        { n: 'Berlin', hb: 410 }, { n: 'Hamburg', hb: 470 }, { n: 'München', hb: 490 }, { n: 'Köln', hb: 475 },
        { n: 'Frankfurt am Main', hb: 460 }, { n: 'Düsseldorf', hb: 440 }, { n: 'Stuttgart', hb: 420 },
        { n: 'Dortmund', hb: 485 }, { n: 'Essen', hb: 480 }, { n: 'Leipzig', hb: 460 }, { n: 'Bremen', hb: 460 },
        { n: 'Hannover', hb: 480 }, { n: 'Dresden', hb: 450 }, { n: 'Duisburg', hb: 520 }, { n: 'Bochum', hb: 480 },
        { n: 'Wuppertal', hb: 490 }, { n: 'Bielefeld', hb: 480 }, { n: 'Bonn', hb: 490 }, { n: 'Münster', hb: 460 },
        { n: 'Karlsruhe', hb: 430 }, { n: 'Mannheim', hb: 430 }, { n: 'Augsburg', hb: 470 }, { n: 'Wiesbaden', hb: 454 },
        { n: 'Gelsenkirchen', hb: 480 }, { n: 'Mönchengladbach', hb: 475 }, { n: 'Braunschweig', hb: 450 },
        { n: 'Chemnitz', hb: 450 }, { n: 'Kiel', hb: 450 }, { n: 'Aachen', hb: 475 }, { n: 'Halle (Saale)', hb: 450 },
        { n: 'Magdeburg', hb: 450 }, { n: 'Freiburg im Breisgau', hb: 430 }, { n: 'Krefeld', hb: 475 },
        { n: 'Lübeck', hb: 460 }, { n: 'Oberhausen', hb: 520 }, { n: 'Erfurt', hb: 470 }, { n: 'Mainz', hb: 440 },
        { n: 'Rostock', hb: 465 }, { n: 'Kassel', hb: 440 }, { n: 'Hagen', hb: 520 }, { n: 'Hamm', hb: 480 },
        { n: 'Saarbrücken', hb: 490 }, { n: 'Mülheim an der Ruhr', hb: 480 }, { n: 'Potsdam', hb: 455 },
        { n: 'Ludwigshafen am Rhein', hb: 425 }, { n: 'Oldenburg', hb: 435 }, { n: 'Leverkusen', hb: 250 },
        { n: 'Osnabrück', hb: 440 }, { n: 'Solingen', hb: 470 }, { n: 'Heidelberg', hb: 420 }, { n: 'Herne', hb: 480 },
        { n: 'Neuss', hb: 455 }, { n: 'Darmstadt', hb: 425 }, { n: 'Paderborn', hb: 440 }, { n: 'Regensburg', hb: 425 },
        { n: 'Ingolstadt', hb: 400 }, { n: 'Würzburg', hb: 420 }, { n: 'Fürth', hb: 425 }, { n: 'Ulm', hb: 430 },
        { n: 'Heilbronn', hb: 420 }, { n: 'Pforzheim', hb: 450 }, { n: 'Wolfsburg', hb: 380 }, { n: 'Göttingen', hb: 430 },
        { n: 'Bottrop', hb: 490 }, { n: 'Reutlingen', hb: 415 }, { n: 'Koblenz', hb: 420 }, { n: 'Bremerhaven', hb: 440 },
        { n: 'Bergisch Gladbach', hb: 460 }, { n: 'Recklinghausen', hb: 480 }, { n: 'Erlangen', hb: 425 },
        { n: 'Remscheid', hb: 490 }, { n: 'Trier', hb: 420 }, { n: 'Jena', hb: 430 }, { n: 'Moers', hb: 480 },
        { n: 'Salzgitter', hb: 450 }, { n: 'Siegen', hb: 470 }, { n: 'Hildesheim', hb: 430 }, { n: 'Cottbus', hb: 400 },
        { n: 'Gütersloh', hb: 420 }, { n: 'Hanau', hb: 430 }, { n: 'Schwerin', hb: 420 }, { n: 'Witten', hb: 480 },
        { n: 'Esslingen am Neckar', hb: 430 }, { n: 'Ludwigsburg', hb: 425 }, { n: 'Gera', hb: 420 },
        { n: 'Kaiserslautern', hb: 415 }, { n: 'Iserlohn', hb: 480 }, { n: 'Düren', hb: 475 }, { n: 'Tübingen', hb: 390 },
        { n: 'Flensburg', hb: 420 }, { n: 'Zwickau', hb: 450 }, { n: 'Ratingen', hb: 400 }, { n: 'Lüdenscheid', hb: 470 },
        { n: 'Villingen-Schwenningen', hb: 400 }, { n: 'Konstanz', hb: 420 }, { n: 'Marl', hb: 480 },
        { n: 'Minden', hb: 430 }, { n: 'Velbert', hb: 470 }, { n: 'Norderstedt', hb: 440 }, { n: 'Delmenhorst', hb: 420 },
        { n: 'Bamberg', hb: 425 }, { n: 'Viersen', hb: 450 }, { n: 'Marburg', hb: 400 }, { n: 'Rheine', hb: 430 },
        { n: 'Dessau-Roßlau', hb: 450 }, { n: 'Lüneburg', hb: 405 }, { n: 'Neumünster', hb: 410 },
        { n: 'Wilhelmshaven', hb: 420 }, { n: 'Troisdorf', hb: 455 }, { n: 'Castrop-Rauxel', hb: 480 },
        { n: 'Arnsberg', hb: 430 }, { n: 'Gladbeck', hb: 480 }, { n: 'Ahlen', hb: 450 }, { n: 'Baden-Baden', hb: 390 },
        { n: 'Bayreuth', hb: 390 }, { n: 'Celle', hb: 420 }, { n: 'Detmold', hb: 435 }, { n: 'Dinslaken', hb: 480 },
        { n: 'Dorsten', hb: 480 }, { n: 'Eisenach', hb: 400 }, { n: 'Emden', hb: 420 }, { n: 'Falkensee', hb: 350 },
        { n: 'Freising', hb: 380 }, { n: 'Friedrichshafen', hb: 420 }, { n: 'Fulda', hb: 400 }, { n: 'Garbsen', hb: 440 },
        { n: 'Greifswald', hb: 420 }, { n: 'Hameln', hb: 420 }, { n: 'Hattingen', hb: 480 }, { n: 'Herten', hb: 480 },
        { n: 'Hürth', hb: 450 }, { n: 'Kerpen', hb: 450 }, { n: 'Landshut', hb: 400 }, { n: 'Lingen (Ems)', hb: 420 },
        { n: 'Lippstadt', hb: 425 }, { n: 'Memmingen', hb: 330 }, { n: 'Merseburg', hb: 420 }, { n: 'Mettmann', hb: 480 },
        { n: 'Nagold', hb: 395 }, { n: 'Neu-Ulm', hb: 350 }, { n: 'Offenburg', hb: 420 }, { n: 'Passau', hb: 390 },
        { n: 'Peine', hb: 410 }, { n: 'Pinneberg', hb: 400 }, { n: 'Plauen', hb: 400 }, { n: 'Radebeul', hb: 400 },
        { n: 'Rosenheim', hb: 400 }, { n: 'Rüsselsheim am Main', hb: 420 }, { n: 'Schwäbisch Gmünd', hb: 400 },
        { n: 'Schwäbisch Hall', hb: 400 }, { n: 'Singen (Hohentwiel)', hb: 400 }, { n: 'Speyer', hb: 415 },
        { n: 'Stade', hb: 380 }, { n: 'Straubing', hb: 400 }, { n: 'Suhl', hb: 420 }, { n: 'Unna', hb: 480 },
        { n: 'Velten', hb: 350 }, { n: 'Waiblingen', hb: 400 }, { n: 'Weimar', hb: 400 }, { n: 'Wetzlar', hb: 390 },
        { n: 'Wismar', hb: 420 }, { n: 'Worms', hb: 420 }, { n: 'Wunstorf', hb: 420 }, { n: 'Zeitz', hb: 400 },
        { n: 'Zweibrücken', hb: 420 }, { n: 'Aalen', hb: 400 }, { n: 'Bad Homburg vor der Höhe', hb: 380 },
        { n: 'Bad Kreuznach', hb: 420 }, { n: 'Bensheim', hb: 380 }, { n: 'Böblingen', hb: 400 },
        { n: 'Bruchsal', hb: 380 }, { n: 'Buchholz in der Nordheide', hb: 380 }, { n: 'Cloppenburg', hb: 380 },
        { n: 'Coesfeld', hb: 420 }, { n: 'Dachau', hb: 350 }, { n: 'Deggendorf', hb: 390 },
        { n: 'Erlangen', hb: 425 }, { n: 'Eschweiler', hb: 475 }, { n: 'Euskirchen', hb: 475 },
        { n: 'Frechen', hb: 450 }, { n: 'Gießen', hb: 420 }, { n: 'Gummersbach', hb: 465 }, { n: 'Hof', hb: 380 },
        { n: 'Hoyerswerda', hb: 400 }, { n: 'Kehl', hb: 400 }, { n: 'Kempen', hb: 435 }, { n: 'Kempten (Allgäu)', hb: 380 },
        { n: 'Korbach', hb: 380 }, { n: 'Limburg an der Lahn', hb: 380 }, { n: 'Lörrach', hb: 390 },
        { n: 'Meppen', hb: 400 }, { n: 'Mühlhausen', hb: 400 }, { n: 'Nordhausen', hb: 400 }, { n: 'Riesa', hb: 400 },
        { n: 'Schwerte', hb: 470 }, { n: 'Stendal', hb: 400 }, { n: 'Achim', hb: 380 }, { n: 'Ahaus', hb: 420 },
        { n: 'Albstadt', hb: 380 }, { n: 'Alsdorf', hb: 475 }, { n: 'Andernach', hb: 400 }, { n: 'Aschaffenburg', hb: 380 },
        { n: 'Bad Nauheim', hb: 380 }, { n: 'Bad Oeynhausen', hb: 420 }, { n: 'Bad Salzuflen', hb: 420 },
        { n: 'Bad Vilbel', hb: 357 }, { n: 'Balingen', hb: 380 }, { n: 'Barsinghausen', hb: 420 },
        { n: 'Beckum', hb: 420 }, { n: 'Bietigheim-Bissingen', hb: 375 }, { n: 'Bramsche', hb: 380 },
        { n: 'Burgdorf', hb: 420 }, { n: 'Burgwedel', hb: 360 }, { n: 'Buxtehude', hb: 380 }, { n: 'Delbrück', hb: 420 },
        { n: 'Diepholz', hb: 380 }, { n: 'Dietzenbach', hb: 380 }, { n: 'Dormagen', hb: 450 }, { n: 'Eberswalde', hb: 400 },
        { n: 'Ellwangen (Jagst)', hb: 380 }, { n: 'Ennepetal', hb: 475 }, { n: 'Forchheim', hb: 380 },
        { n: 'Germering', hb: 380 }, { n: 'Gevelsberg', hb: 465 }, { n: 'Grevenbroich', hb: 450 },
        { n: 'Gronau (Westf.)', hb: 420 }, { n: 'Haan', hb: 420 }, { n: 'Heinsberg', hb: 420 },
        { n: 'Helmstedt', hb: 380 }, { n: 'Hemer', hb: 470 }, { n: 'Herford', hb: 420 }, { n: 'Hockenheim', hb: 380 },
        { n: 'Hohen Neuendorf', hb: 350 }, { n: 'Holzminden', hb: 380 }, { n: 'Idar-Oberstein', hb: 420 },
        { n: 'Ilmenau', hb: 400 }, { n: 'Kamp-Lintfort', hb: 480 }, { n: 'Kamen', hb: 480 }, { n: 'Kevelaer', hb: 420 },
        { n: 'Kleve', hb: 420 }, { n: 'Königswinter', hb: 450 }, { n: 'Langen (Hessen)', hb: 380 },
        { n: 'Lehrte', hb: 420 }, { n: 'Lemgo', hb: 420 }, { n: 'Lohmar', hb: 450 },
        { n: 'Nürnberg', hb: 447 }
];


export { cityHebesatzList };
export type { CityHebesatz };