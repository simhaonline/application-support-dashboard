import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiParseLinks, JhiAlertService, JhiDataUtils } from 'ng-jhipster';
import { IProblemUpdates } from 'app/shared/model/problem-updates.model';
import { AccountService } from 'app/core';
import { FIXED_ITEMS_PER_PAGE } from 'app/shared';
import { ProblemUpdatesService } from './problem-updates.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProblemService } from 'app/entities/problem';
import { IProblem } from 'app/shared/model/problem.model';
import { RiskUpdatesService } from 'app/entities/risk-updates';
import { IIncident } from 'app/shared/model/incident.model';
import { IncidentService } from 'app/entities/incident';
import { IncidentUpdatesService } from 'app/entities/incident-updates';

@Component({
    selector: 'jhi-problem-updates',
    templateUrl: './problem-updates.component.html',
    styleUrls: ['./problem-updates.component.scss']
})
export class ProblemUpdatesComponent implements OnInit, OnDestroy {
    problemUpdates: IProblemUpdates[];
    problemIncidents: IIncident[];
    problemID: number;
    problem: IProblem;
    currentAccount: any;
    eventSubscriber: Subscription;
    itemsPerPage: number;
    links: any;
    page: any;
    predicate: any;
    reverse: any;
    totalItems: number;

    constructor(
        protected problemUpdatesService: ProblemUpdatesService,
        protected jhiAlertService: JhiAlertService,
        protected dataUtils: JhiDataUtils,
        protected eventManager: JhiEventManager,
        protected parseLinks: JhiParseLinks,
        private route: ActivatedRoute,
        private problemService: ProblemService,
        protected accountService: AccountService,
        private router: Router,
        private riskUpdatesService: RiskUpdatesService,
        private incidentService: IncidentService,
        private incidentUpdatesService: IncidentUpdatesService
    ) {
        this.problemUpdates = [];
        this.problemIncidents = [];
        this.itemsPerPage = FIXED_ITEMS_PER_PAGE;
        this.page = 0;
        this.links = {
            last: 0
        };
        this.predicate = 'id';
        this.reverse = true;
    }

    previousState() {
        this.router.navigate([this.problemUpdatesService.returnRoute]);
    }

    setRiskUpdatesReturnPage(riskID) {
        this.riskUpdatesService.returnRoute = '/problem-updates/' + this.problem.id;
        this.router.navigate(['risk-updates', riskID]);
    }

    setIncidentUpdatesReturnPage(incidentID) {
        this.incidentUpdatesService.returnRoute = '/problem-updates/' + this.problem.id;
        this.router.navigate(['incident-updates', incidentID]);
    }

    loadAll() {
        this.problemUpdatesService
            .query(this.problemID, {
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IProblemUpdates[]>) => {
                    this.paginateProblemUpdates(res.body, res.headers);
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );

        this.incidentService
            .problemIncidents(this.problemID, {
                page: this.page,
                size: this.itemsPerPage,
                sort: this.sort()
            })
            .subscribe(
                (res: HttpResponse<IIncident[]>) => {
                    this.paginateProblemIncidents(res.body, res.headers);
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    getProblemDetails() {
        this.problemService.find(this.problemID).subscribe(
            (res: HttpResponse<IProblem>) => {
                this.problem = res.body;
            },
            (res: HttpErrorResponse) => {
                this.onError(res.message);
            }
        );
    }

    reset() {
        this.page = 0;
        this.problemUpdates = [];
        this.loadAll();
    }

    loadPage(page) {
        this.page = page;
        this.loadAll();
    }

    ngOnInit() {
        this.problemID = this.route.snapshot.params['problemID'];
        this.problemUpdatesService.problemID = this.problemID;
        this.getProblemDetails();
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInProblemUpdates();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IProblemUpdates) {
        return item.id;
    }

    byteSize(field) {
        return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        return this.dataUtils.openFile(contentType, field);
    }

    registerChangeInProblemUpdates() {
        this.eventSubscriber = this.eventManager.subscribe('problemUpdatesListModification', response => this.reset());
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    protected paginateProblemUpdates(data: IProblemUpdates[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        for (let i = 0; i < data.length; i++) {
            this.problemUpdates.push(data[i]);
        }
    }

    protected paginateProblemIncidents(data: IIncident[], headers: HttpHeaders) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = parseInt(headers.get('X-Total-Count'), 10);
        for (let i = 0; i < data.length; i++) {
            this.problemIncidents.push(data[i]);
        }
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
