/* tslint:disable max-line-length */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Data } from '@angular/router';
import { ApplicationSupportDashboardTestModule } from '../../../test.module';
import { ProblemComponent } from 'app/entities/problem/problem.component';
import { ProblemService } from 'app/entities/problem/problem.service';
import { Problem } from 'app/shared/model/problem.model';
import { ProblemUpdatesService } from 'app/entities/problem-updates';
import { RiskUpdatesService } from 'app/entities/risk-updates';

describe('Component Tests', () => {
    describe('Problem Management Component', () => {
        let comp: ProblemComponent;
        let fixture: ComponentFixture<ProblemComponent>;
        let service: ProblemService;
        let service1: ProblemUpdatesService;
        let service2: RiskUpdatesService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [ApplicationSupportDashboardTestModule],
                declarations: [ProblemComponent],
                providers: [
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            data: {
                                subscribe: (fn: (value: Data) => void) =>
                                    fn({
                                        pagingParams: {
                                            predicate: 'id',
                                            reverse: false,
                                            page: 0
                                        }
                                    })
                            }
                        }
                    }
                ]
            })
                .overrideTemplate(ProblemComponent, '')
                .compileComponents();

            fixture = TestBed.createComponent(ProblemComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(ProblemService);
            service1 = fixture.debugElement.injector.get(ProblemUpdatesService);
            service2 = fixture.debugElement.injector.get(RiskUpdatesService);
        });

        it('Should call load all on init', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Problem(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.problems[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });

        it('should load a page', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Problem(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.loadPage(1);

            // THEN
            expect(service.query).toHaveBeenCalled();
            expect(comp.problems[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });

        it('should clear the filter values', () => {
            // GIVEN
            comp.selectedPriority = 'HIGH';
            comp.selectedStatus = 'OPEN';

            // WHEN
            comp.onClearFilter();

            // THEN
            expect(comp.selectedStatus).toEqual('ALL');
            expect(comp.selectedPriority).toEqual('ALL');
        });

        it('should re-initialize the page', () => {
            // GIVEN
            const headers = new HttpHeaders().append('link', 'link;link');
            spyOn(service, 'query').and.returnValue(
                of(
                    new HttpResponse({
                        body: [new Problem(123)],
                        headers
                    })
                )
            );

            // WHEN
            comp.loadPage(1);
            comp.reset();

            // THEN
            expect(comp.page).toEqual(0);
            expect(service.query).toHaveBeenCalledTimes(2);
            expect(comp.problems[0]).toEqual(jasmine.objectContaining({ id: 123 }));
        });
        it('should calculate the sort attribute for an id', () => {
            // WHEN
            const result = comp.sort();

            // THEN
            expect(result).toEqual(['id,asc']);
        });

        it('should calculate the sort attribute for a non-id attribute', () => {
            // GIVEN
            comp.predicate = 'name';

            // WHEN
            const result = comp.sort();

            // THEN
            expect(result).toEqual(['name,asc', 'id']);
        });

        it('should give return routes', () => {
            // WHEN
            comp.setRiskUpdatesReturnPage(1);
            comp.setProblemUpdatesReturnPage(1);

            // THEN
            expect(service1.returnRoute).toEqual('/problem');
            expect(service2.returnRoute).toEqual('/problem');
        });
    });
});
