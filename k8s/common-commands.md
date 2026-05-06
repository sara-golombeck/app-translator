טבלת פקודות מהירה
פעולה
פקודה
Deploy
kubectl apply -f <file>
מחק
kubectl delete -f <file>
סטטוס Pods
kubectl get pods
סטטוס Services
kubectl get services
Logs
kubectl logs deployment/<name>
Logs real-time
kubectl logs -f deployment/<name>
Logs קודם
kubectl logs deployment/<name> --previous
Describe
kubectl describe pod <pod-name>
Exec
kubectl exec -it deployment/<name> -- /bin/sh
Port forward
kubectl port-forward service/<name> 8080:80
רענן Pod
kubectl delete pod -l app=<name>
כל הכלל
kubectl get all


