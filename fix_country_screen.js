import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'components/country/CountryDetailScreen.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<div className="mt-8">\s*<FrankfurterWidget \/>\s*<RestCountriesWidget[^>]*\/>\s*<WorldBankWidget[^>]*\/>\s*<\/div>/, '');
content = content.replace(/{\/\* LOCAION \(NEW\) \*\/}\s*<SectionWrapper id="geography"[\s\S]*?<\/SectionWrapper>/, '');
content = content.replace(/{\/\* EXTERNAL NEWS & RESOURCES \*\/}\s*<SectionWrapper id="news"[\s\S]*?<\/SectionWrapper>/, '');
content = content.replace(/<MetMuseumWidget[^>]*\/>/, '');
content = content.replace(/<PublicHolidaysWidget[^>]*\/>/, '');
content = content.replace(/<UniversitiesWidget[^>]*\/>/, '');

content = content.replace(/{\/\* VISUALS \*\/}\s*<SectionWrapper id="Visuals"[\s\S]*?<\/SectionWrapper>/,
`{/* VISUALS */}
               <SectionWrapper id="Visuals" title="Visual Archive" icon={ImageIcon} subtitle="Historical & Cultural Imagery" setRef={setRef('Visuals')}>
                   <ImageArchiveGrid images={data.imageArchive || []} />
               </SectionWrapper>

               {/* EXTERNAL NEWS & RESOURCES MULTI-GRID */}
               <SectionWrapper id="news" title="External Repositories & Data" icon={Globe} isVisible={true}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <FrankfurterWidget />
                            <RestCountriesWidget countryName={countryName} />
                            <WorldBankWidget countryName={countryName} />
                            <OpenStreetMapWidget countryName={countryName} />
                            <OpenMeteoWidget locationName={data.capital || countryName} />
                            <MetMuseumWidget queryText={countryName} />
                        </div>
                        <div className="space-y-6">
                            <WorldBankIndicatorsWidget countryName={countryName} />
                            <OpenAQWidget countryName={countryName} />
                            <ReliefWebWidget queryText={countryName} />
                            <OpenAlexWidget queryText={countryName} />
                            <WikipediaWidget title={countryName} />
                            <UniversitiesWidget countryName={countryName} />
                        </div>
                        <div className="space-y-6">
                            <GDELTWidget queryText={countryName} />
                            <LibraryOfCongressWidget queryText={countryName} />
                            <SemanticScholarWidget queryText={countryName} />
                            <DOAJWidget queryText={countryName} />
                            <ArtInstituteChicagoWidget queryText={countryName} />
                            <PublicHolidaysWidget countryName={countryName} />
                        </div>
                    </div>
               </SectionWrapper>`);

fs.writeFileSync(file, content);
console.log('Done');
